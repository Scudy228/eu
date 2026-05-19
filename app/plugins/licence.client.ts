import { initLicence } from '~/composables/useLicence'

export default defineNuxtPlugin(async () => {
	await initLicence()
})
