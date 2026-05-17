<template>
	<Teleport to="body">
		<Transition name="modal-licence">
			<div
				v-if="licenceModalOpen"
				class="fixed inset-0 z-[100] flex items-center justify-center p-4"
				role="dialog"
				aria-modal="true"
				aria-label="Gestion de la licence"
			>
				<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="licenceModalOpen = false" />

				<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg">
					<!-- En-tête gradient -->
					<div
						class="relative px-7 py-6 flex items-center justify-between"
						:class="isPremium
							? 'bg-gradient-to-br from-emerald-600 to-teal-500'
							: 'bg-gradient-to-br from-[#003399] to-[#001A88]'"
					>
						<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
						<div class="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

						<div class="flex items-center gap-4 relative">
							<div class="rounded-2xl bg-white/20 p-3 shrink-0">
								<UIcon
									:name="isPremium ? 'lucide:badge-check' : 'lucide:key'"
									class="size-7 text-white"
								/>
							</div>
							<div>
								<h2 class="text-xl font-black text-white">
									{{ isPremium ? 'Licence Premium active' : 'Activer la licence' }}
								</h2>
								<p class="text-sm font-medium mt-0.5 text-white/75">
									{{ isPremium ? `Clé : ${maskedKey}` : `Version gratuite — ${FREE_INVOICE_LIMIT} décomptes max` }}
								</p>
								<p v-if="isPremium && planType" class="text-sm font-bold text-white/90">
									{{ planType === 'one_time' ? '✦ Licence à vie' : '↻ Abonnement actif' }}
								</p>
							</div>
						</div>
						<button
							class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0"
							@click="licenceModalOpen = false"
						>
							<UIcon name="lucide:x" class="size-6" />
						</button>
					</div>

					<!-- Corps -->
					<div class="px-7 py-6 space-y-5">
						<!-- Mode premium -->
						<template v-if="isPremium">
							<div class="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5 flex items-center gap-4">
								<UIcon name="lucide:check-circle-2" class="size-8 text-emerald-500 shrink-0" />
								<div>
									<p class="text-lg font-black text-emerald-700">Accès illimité activé</p>
									<p class="text-sm text-emerald-600 mt-0.5">Décomptes illimités · PDF · Export CSV</p>
								</div>
							</div>

							<!-- Infos licence -->
							<div class="rounded-2xl border-2 border-slate-100 divide-y divide-slate-100">
								<div class="flex items-center justify-between px-5 py-4 gap-3">
									<div class="flex items-center gap-3 text-base text-slate-600">
										<UIcon name="lucide:monitor" class="size-5 shrink-0 text-[#003399]" />
										<span class="font-semibold">Appareils connectés</span>
									</div>
									<div class="flex items-center gap-3">
										<span
											v-if="activatedDevices !== null && maxDevices !== null"
											class="text-lg font-black"
											:class="activatedDevices >= maxDevices ? 'text-red-500' : 'text-emerald-600'"
										>
											{{ activatedDevices }} / {{ maxDevices }}
										</span>
										<span v-else class="text-base text-slate-300">—</span>
										<div v-if="activatedDevices !== null && maxDevices !== null" class="flex gap-1">
											<div
												v-for="i in maxDevices"
												:key="i"
												class="h-3 w-3 rounded-full transition-colors"
												:class="i <= activatedDevices ? 'bg-emerald-500' : 'bg-slate-200'"
											/>
										</div>
									</div>
								</div>

								<div class="flex items-center justify-between px-5 py-4 gap-3">
									<div class="flex items-center gap-3 text-base text-slate-600">
										<UIcon name="lucide:calendar" class="size-5 shrink-0 text-[#003399]" />
										<span class="font-semibold">Validité</span>
									</div>
									<span class="text-base font-bold" :class="expiresAt ? 'text-slate-700' : 'text-emerald-600'">
										{{ expiresAt ? new Intl.DateTimeFormat('fr-BE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(expiresAt)) : '✦ À vie' }}
									</span>
								</div>

								<div v-if="planType" class="flex items-center justify-between px-5 py-4 gap-3">
									<div class="flex items-center gap-3 text-base text-slate-600">
										<UIcon name="lucide:tag" class="size-5 shrink-0 text-[#003399]" />
										<span class="font-semibold">Plan</span>
									</div>
									<span
										class="text-sm font-black px-3 py-1 rounded-full"
										:class="planType === 'one_time' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'"
									>
										{{ planType === 'one_time' ? 'Licence à vie' : 'Abonnement' }}
									</span>
								</div>
							</div>

							<button
								class="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-red-200 py-4 text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
								:disabled="deactivating"
								@click="doDeactivate"
							>
								<UIcon name="lucide:log-out" class="size-5" />
								{{ deactivating ? 'Désactivation…' : 'Désactiver sur cet appareil' }}
							</button>
						</template>

						<!-- Mode gratuit -->
						<template v-else>
							<!-- Avantages -->
							<div class="rounded-2xl bg-amber-50 border-2 border-amber-200 p-5 space-y-3">
								<p class="text-base font-black text-amber-800">Passez en Premium pour débloquer :</p>
								<ul class="space-y-2">
									<li class="flex items-center gap-3 text-base text-slate-700">
										<UIcon name="lucide:infinity" class="size-5 text-amber-500 shrink-0" />
										Décomptes illimités
									</li>
									<li class="flex items-center gap-3 text-base text-slate-700">
										<UIcon name="lucide:file-text" class="size-5 text-amber-500 shrink-0" />
										Génération PDF (formulaire DRS FR 02-2021)
									</li>
									<li class="flex items-center gap-3 text-base text-slate-700">
										<UIcon name="lucide:mail" class="size-5 text-amber-500 shrink-0" />
										Export CSV + envoi email automatique
									</li>
								</ul>
							</div>

							<!-- Champ clé -->
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">
									Clé de licence
								</label>
								<input
									v-model="keyInput"
									type="text"
									placeholder="SCUDY-EURM-XXXX-XXXX-XXXX-XXXX-XXXX"
									:disabled="isActivating"
									class="w-full h-14 px-4 text-base font-mono rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900 placeholder-slate-400"
									@keydown.enter="doActivate"
								>
								<p v-if="activationError" class="mt-2 text-sm font-bold text-red-600 flex items-center gap-2">
									<UIcon name="lucide:alert-circle" class="size-4 shrink-0" />
									{{ errorLabel }}
								</p>
							</div>

							<!-- Boutons -->
							<div class="flex flex-col gap-3">
								<button
									class="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-black text-white bg-[#003399] hover:bg-[#002277] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
									:disabled="isActivating || !keyInput.trim()"
									@click="doActivate"
								>
									<UIcon name="lucide:key" class="size-5" />
									{{ isActivating ? 'Activation…' : 'Activer la licence' }}
								</button>
								<button
									class="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-[#003399] border-2 border-[#003399] hover:bg-blue-50 transition-colors"
									@click="openPurchase"
								>
									<UIcon name="lucide:shopping-cart" class="size-5" />
									Acheter une licence — scudyweb.com
								</button>
							</div>
						</template>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script lang="ts" setup>
const { isPremium, licenceKey, planType, maxDevices, activatedDevices, expiresAt, licenceModalOpen, isActivating, activationError, errorLabel, FREE_INVOICE_LIMIT, activate, deactivate } = useLicence();
const toast = useToast();

const keyInput = ref('');
const deactivating = ref(false);

const maskedKey = computed(() => {
	if (!licenceKey.value) return '';
	const parts = licenceKey.value.split('-');
	return parts.map((p, i) => (i < 2 ? p : '****')).join('-');
});

watch(licenceModalOpen, (open) => {
	if (!open) keyInput.value = '';
});

async function doActivate() {
	if (!keyInput.value.trim()) return;
	const ok = await activate(keyInput.value);
	if (ok) {
		licenceModalOpen.value = false;
		toast.add({ title: 'Licence activée !', description: 'Accès Premium débloqué.', color: 'success' });
	}
}

async function doDeactivate() {
	deactivating.value = true;
	try {
		await deactivate();
		licenceModalOpen.value = false;
		toast.add({ title: 'Licence désactivée', description: 'Appareil retiré de votre licence.', color: 'info' });
	} finally {
		deactivating.value = false;
	}
}

async function openPurchase() {
	const { open } = await import('@tauri-apps/plugin-shell');
	await open('https://scudyweb.be/pay/eu');
}
</script>
