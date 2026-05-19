<template>
	<div class="relative min-h-screen">
		<!-- Orbes flottantes en arrière-plan -->
		<div class="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
			<div class="orb orb-1" />
			<div class="orb orb-2" />
			<div class="orb orb-3" />
			<div class="orb orb-4" />
			<div class="orb orb-5" />
			<div class="orb orb-6" />
		</div>

		<div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
			<slot />
		</div>
		<ModalLicence />
	</div>
</template>
