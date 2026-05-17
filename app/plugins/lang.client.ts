import { useLang } from "~/composables/useLang";

export default defineNuxtPlugin(() => {
	const { initLang } = useLang();
	initLang();
});
