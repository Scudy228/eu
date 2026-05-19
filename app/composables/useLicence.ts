import { fetch as tauriFetch } from '@tauri-apps/plugin-http'
import { load as loadStore } from '@tauri-apps/plugin-store'
import { type as getTauriOsType } from '@tauri-apps/plugin-os'

// ── Configuration ────────────────────────────────────────────────────────────
export const FREE_INVOICE_LIMIT = 5
const APP_SLUG = 'eu-rcam'
const API_BASE = 'https://scudyweb.be'

// Clé publique Ed25519 (SPKI DER base64) — copier depuis LICENCE_PUBLIC_KEY dans .env scudyweb
// Laisser vide = validation en ligne obligatoire (mode dégradé sécurisé)
const PUBLIC_KEY_B64 = 'MCowBQYDK2VwAyEAvhPFJmk431vsDbV/fMNZ8UQPvJOMSHFQRiQRJv+usK0='

// ── Types ────────────────────────────────────────────────────────────────────
interface OfflinePayload {
	lid: number
	app: string
	exp: number // unix timestamp (0 = lifetime)
	max: number
	iat: number
	ovu: number // offline valid until
}

interface ValidateResult {
	valid: boolean
	offlineToken?: string
	reason?: string
	planType?: string
	maxDevices?: number
	activatedDevices?: number
	expiresAt?: string | null
}

// ── Module-level singleton state ─────────────────────────────────────────────
const isPremium = ref(false)
const licenceKey = ref<string | null>(null)
const planType = ref<string | null>(null)
const maxDevices = ref<number | null>(null)
const activatedDevices = ref<number | null>(null)
const expiresAt = ref<string | null>(null)
const isActivating = ref(false)
const activationError = ref<string | null>(null)
const licenceModalOpen = ref(false)
let initialized = false

// ── Helpers ──────────────────────────────────────────────────────────────────
function b64urlToBytes(s: string): Uint8Array {
	return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
}

async function verifyOfflineToken(token: string): Promise<OfflinePayload | null> {
	if (!PUBLIC_KEY_B64) return null
	try {
		const [d, s] = token.split('.')
		if (!d || !s) return null
		const data = b64urlToBytes(d)
		const sig = b64urlToBytes(s)
		const pk = Uint8Array.from(atob(PUBLIC_KEY_B64), c => c.charCodeAt(0))
		const key = await crypto.subtle.importKey('spki', pk, { name: 'Ed25519' }, false, ['verify'])
		if (!await crypto.subtle.verify('Ed25519', key, sig, data)) return null
		const payload = JSON.parse(new TextDecoder().decode(data)) as OfflinePayload
		const now = Math.floor(Date.now() / 1000)
		if (payload.ovu < now || payload.app !== APP_SLUG) return null
		if (payload.exp !== 0 && payload.exp < now) return null
		return payload
	}
	catch { return null }
}

async function getStore() {
	return loadStore('licence.bin', { autoSave: true })
}

async function getOrCreateDeviceId(): Promise<string> {
	const store = await getStore()
	let id = await store.get<string>('device-id')
	if (!id) {
		id = crypto.randomUUID()
		await store.set('device-id', id)
	}
	return id
}

async function validateOnline(key: string): Promise<ValidateResult> {
	try {
		const deviceId = await getOrCreateDeviceId()
		const osType = await getTauriOsType()
		const url = new URL(`${API_BASE}/api/licence/validate`)
		url.searchParams.set('key', key)
		url.searchParams.set('device_id', deviceId)
		url.searchParams.set('device_name', `${osType} Device`)
		const res = await tauriFetch(url.toString())
		return await res.json()
	}
	catch (err: any) {
		const detail = err?.message ?? String(err)
		return { valid: false, reason: `NETWORK_ERROR: ${detail}` }
	}
}

function applyValidResult(key: string, result: ValidateResult) {
	licenceKey.value = key
	isPremium.value = true
	planType.value = result.planType ?? null
	maxDevices.value = result.maxDevices ?? null
	activatedDevices.value = result.activatedDevices ?? null
	expiresAt.value = result.expiresAt ?? null
}

async function revalidateOnline(key: string) {
	const store = await getStore()
	const result = await validateOnline(key)
	if (result.valid && result.offlineToken) {
		await store.set('offline-token', result.offlineToken)
		await store.set('licence-info', JSON.stringify({
			planType: result.planType,
			maxDevices: result.maxDevices,
			activatedDevices: result.activatedDevices,
			expiresAt: result.expiresAt ?? null,
		}))
		applyValidResult(key, result)
	}
	else if (result.reason && !result.reason.startsWith('NETWORK_ERROR')) {
		await store.delete('licence-key')
		await store.delete('offline-token')
		await store.delete('licence-info')
		licenceKey.value = null
		isPremium.value = false
		planType.value = null
		maxDevices.value = null
		activatedDevices.value = null
		expiresAt.value = null
	}
}

// ── Init (appelé par le plugin) ───────────────────────────────────────────────
export async function initLicence() {
	if (initialized) return
	initialized = true
	try {
		const store = await getStore()
		const key = await store.get<string>('licence-key')
		if (!key) return
		const token = await store.get<string>('offline-token')
		if (token) {
			const payload = await verifyOfflineToken(token)
			if (payload) {
				licenceKey.value = key
				isPremium.value = true
				maxDevices.value = payload.max
				// Restaurer les infos mises en cache
				const cached = await store.get<string>('licence-info')
				if (cached) {
					try {
						const info = JSON.parse(cached)
						planType.value = info.planType ?? null
						activatedDevices.value = info.activatedDevices ?? null
						expiresAt.value = info.expiresAt ?? null
					}
					catch {}
				}
				// Re-valider en arrière-plan si le token expire dans moins de 3 jours
				const now = Math.floor(Date.now() / 1000)
				if (payload.ovu - now < 3 * 86400) {
					revalidateOnline(key)
				}
				return
			}
		}
		// Token absent ou expiré → validation en ligne
		await revalidateOnline(key)
	}
	catch {}
}

// ── Composable ────────────────────────────────────────────────────────────────
export const useLicence = () => {
	const activate = async (key: string): Promise<boolean> => {
		isActivating.value = true
		activationError.value = null
		try {
			const result = await validateOnline(key.trim().toUpperCase())
			if (result.valid && result.offlineToken) {
				const store = await getStore()
				const normalized = key.trim().toUpperCase()
				await store.set('licence-key', normalized)
				await store.set('offline-token', result.offlineToken)
				await store.set('licence-info', JSON.stringify({
					planType: result.planType,
					maxDevices: result.maxDevices,
					activatedDevices: result.activatedDevices,
					expiresAt: result.expiresAt ?? null,
				}))
				applyValidResult(normalized, result)
				return true
			}
			activationError.value = result.reason ?? 'INVALID'
			return false
		}
		catch {
			activationError.value = 'NETWORK_ERROR'
			return false
		}
		finally {
			isActivating.value = false
		}
	}

	const deactivate = async () => {
		try {
			const store = await getStore()
			const key = licenceKey.value
			const deviceId = await getOrCreateDeviceId()
			if (key) {
				tauriFetch(`${API_BASE}/api/licence/deactivate`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ key, device_id: deviceId }),
				}).catch(() => {})
			}
			await store.delete('licence-key')
			await store.delete('offline-token')
			await store.delete('licence-info')
		}
		catch {}
		finally {
			licenceKey.value = null
			isPremium.value = false
			planType.value = null
			maxDevices.value = null
			activatedDevices.value = null
			expiresAt.value = null
		}
	}

	const errorLabel = computed(() => {
		switch (activationError.value) {
			case 'LICENCE_NOT_FOUND': return 'Clé introuvable.'
			case 'SUSPENDED': return 'Licence suspendue. Contactez le support.'
			case 'EXPIRED': return 'Licence expirée.'
			case 'CANCELLED': return 'Licence annulée.'
			case 'MAX_DEVICES_REACHED': return 'Nombre max d\'appareils atteint. Désactivez un appareil sur scudyweb.com.'
			default:
				if (activationError.value?.startsWith('NETWORK_ERROR:'))
					return `Erreur réseau : ${activationError.value.slice(14)}`
				return 'Clé invalide.'
		}
	})

	return {
		isPremium: readonly(isPremium),
		licenceKey: readonly(licenceKey),
		planType: readonly(planType),
		maxDevices: readonly(maxDevices),
		activatedDevices: readonly(activatedDevices),
		expiresAt: readonly(expiresAt),
		isActivating: readonly(isActivating),
		activationError: readonly(activationError),
		errorLabel,
		licenceModalOpen,
		FREE_INVOICE_LIMIT,
		activate,
		deactivate,
	}
}
