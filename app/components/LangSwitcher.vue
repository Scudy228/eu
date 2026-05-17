<template>
	<div class="relative" ref="wrapperRef">
		<button
			class="flex items-center gap-2 h-11 px-3 rounded-xl border-2 border-slate-200 bg-white hover:border-[#003399] hover:bg-blue-50 transition-colors font-semibold text-sm text-slate-700"
			@click="open = !open"
		>
			<span :class="`fi fi-${currentFlagCode} text-base`" />
			<span class="hidden sm:inline">{{ currentName }}</span>
			<UIcon name="lucide:chevron-down" class="size-4 text-slate-400 transition-transform" :class="open && 'rotate-180'" />
		</button>

		<Transition name="dropdown">
			<div
				v-if="open"
				class="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
			>
				<div class="p-2 max-h-72 overflow-y-auto">
					<button
						v-for="locale in EU_LOCALES"
						:key="locale.code"
						class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-[#003399] transition-colors"
						:class="currentLocale === locale.code && 'bg-blue-50 text-[#003399] font-bold'"
						@click="selectLocale(locale.code)"
					>
						<span :class="`fi fi-${locale.countryCode} text-base`" />
						{{ locale.name }}
					</button>
				</div>
			</div>
		</Transition>
	</div>
</template>

<script lang="ts" setup>
import type { LocaleCode } from '~/composables/useLang';

const { currentLocale, setLocale, EU_LOCALES } = useLang();
const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

const currentFlagCode = computed(() =>
	EU_LOCALES.find(l => l.code === currentLocale.value)?.countryCode ?? 'eu'
);
const currentName = computed(() =>
	EU_LOCALES.find(l => l.code === currentLocale.value)?.name ?? ''
);

const selectLocale = (code: LocaleCode) => {
	setLocale(code);
	open.value = false;
};

onClickOutside(wrapperRef, () => { open.value = false; });
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity .15s ease, transform .15s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-6px) scale(.97); }
</style>
