import bgMessages from "~/locales/bg.json";
import csMessages from "~/locales/cs.json";
import daMessages from "~/locales/da.json";
import deMessages from "~/locales/de.json";
import elMessages from "~/locales/el.json";
import enMessages from "~/locales/en.json";
import esMessages from "~/locales/es.json";
import etMessages from "~/locales/et.json";
import fiMessages from "~/locales/fi.json";
import frMessages from "~/locales/fr.json";
import hrMessages from "~/locales/hr.json";
import huMessages from "~/locales/hu.json";
import itMessages from "~/locales/it.json";
import ltMessages from "~/locales/lt.json";
import lvMessages from "~/locales/lv.json";
import mtMessages from "~/locales/mt.json";
import nlMessages from "~/locales/nl.json";
import plMessages from "~/locales/pl.json";
import ptMessages from "~/locales/pt.json";
import roMessages from "~/locales/ro.json";
import skMessages from "~/locales/sk.json";
import slMessages from "~/locales/sl.json";
import svMessages from "~/locales/sv.json";

export const EU_LOCALES = [
	{ code: "bg", name: "Български", flag: "🇧🇬", countryCode: "bg" },
	{ code: "cs", name: "Čeština", flag: "🇨🇿", countryCode: "cz" },
	{ code: "da", name: "Dansk", flag: "🇩🇰", countryCode: "dk" },
	{ code: "de", name: "Deutsch", flag: "🇩🇪", countryCode: "de" },
	{ code: "el", name: "Ελληνικά", flag: "🇬🇷", countryCode: "gr" },
	{ code: "en", name: "English", flag: "🇬🇧", countryCode: "gb" },
	{ code: "es", name: "Español", flag: "🇪🇸", countryCode: "es" },
	{ code: "et", name: "Eesti", flag: "🇪🇪", countryCode: "ee" },
	{ code: "fi", name: "Suomi", flag: "🇫🇮", countryCode: "fi" },
	{ code: "fr", name: "Français", flag: "🇫🇷", countryCode: "fr" },
	{ code: "hr", name: "Hrvatski", flag: "🇭🇷", countryCode: "hr" },
	{ code: "hu", name: "Magyar", flag: "🇭🇺", countryCode: "hu" },
	{ code: "it", name: "Italiano", flag: "🇮🇹", countryCode: "it" },
	{ code: "lt", name: "Lietuvių", flag: "🇱🇹", countryCode: "lt" },
	{ code: "lv", name: "Latviešu", flag: "🇱🇻", countryCode: "lv" },
	{ code: "mt", name: "Malti", flag: "🇲🇹", countryCode: "mt" },
	{ code: "nl", name: "Nederlands", flag: "🇳🇱", countryCode: "nl" },
	{ code: "pl", name: "Polski", flag: "🇵🇱", countryCode: "pl" },
	{ code: "pt", name: "Português", flag: "🇵🇹", countryCode: "pt" },
	{ code: "ro", name: "Română", flag: "🇷🇴", countryCode: "ro" },
	{ code: "sk", name: "Slovenčina", flag: "🇸🇰", countryCode: "sk" },
	{ code: "sl", name: "Slovenščina", flag: "🇸🇮", countryCode: "si" },
	{ code: "sv", name: "Svenska", flag: "🇸🇪", countryCode: "se" }
] as const;

export type LocaleCode = typeof EU_LOCALES[number]["code"];

const allMessages: Record<LocaleCode, Record<string, any>> = {
	fr: frMessages,
	en: enMessages,
	de: deMessages,
	it: itMessages,
	es: esMessages,
	nl: nlMessages,
	pl: plMessages,
	pt: ptMessages,
	ro: roMessages,
	bg: bgMessages,
	cs: csMessages,
	da: daMessages,
	el: elMessages,
	et: etMessages,
	fi: fiMessages,
	hr: hrMessages,
	hu: huMessages,
	lt: ltMessages,
	lv: lvMessages,
	mt: mtMessages,
	sk: skMessages,
	sl: slMessages,
	sv: svMessages
};

// Module-level singleton so all components share the same state
const currentLocale = ref<LocaleCode>("fr");
const messages = computed(() => allMessages[currentLocale.value] ?? allMessages.fr);

export const useLang = () => {
	const setLocale = (locale: LocaleCode) => {
		currentLocale.value = locale;
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("eu-lang", locale);
		}
	};

	const initLang = () => {
		if (typeof localStorage === "undefined") return;
		const saved = localStorage.getItem("eu-lang") as LocaleCode | null;
		if (saved && EU_LOCALES.some((l) => l.code === saved)) {
			currentLocale.value = saved;
		}
	};

	const t = (key: string, params?: Record<string, string | number>): string => {
		const keys = key.split(".");
		let val: any = messages.value;
		for (const k of keys) {
			if (val == null || typeof val !== "object") return key;
			val = val[k];
		}
		if (typeof val !== "string") return key;
		if (params) {
			return val.replace(/\{(\w+)\}/g, (_: string, k: string) => String(params[k] ?? `{${k}}`));
		}
		return val;
	};

	return {
		currentLocale: readonly(currentLocale),
		t,
		setLocale,
		initLang,
		EU_LOCALES
	};
};
