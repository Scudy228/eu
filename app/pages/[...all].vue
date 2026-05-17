<template>
	<div class="min-h-screen flex items-center justify-center bg-[#EEF2FF] p-6">
		<div class="text-center space-y-6 max-w-md">
			<div class="flex justify-center">
				<div class="rounded-3xl bg-white border-2 border-slate-200 p-8 shadow-xl">
					<UIcon name="lucide:file-question" class="size-20 text-[#003399] mx-auto" />
				</div>
			</div>
			<div class="space-y-3">
				<h1 class="text-4xl font-black text-slate-900">Page introuvable</h1>
				<p class="text-xl text-slate-600 font-medium">Cette page n'existe pas ou a été déplacée.</p>
			</div>
			<NuxtLink
				to="/"
				class="inline-flex items-center gap-3 rounded-2xl bg-[#003399] hover:bg-[#002277] text-white font-bold text-lg px-8 py-4 transition-colors shadow-lg"
			>
				<UIcon name="lucide:home" class="size-6" />
				Retour à l'accueil
			</NuxtLink>
		</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: 'blank' });
</script>
