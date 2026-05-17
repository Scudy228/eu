<script setup lang="ts">
useSeo({
  title: 'Accueil | Scudyweb',
  description: 'Projet Nuxtaur by Scudyweb — scudyweb.be',
})
</script>

<template>
  <section class="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
    <!-- Arrière-plan -->
    <div class="absolute inset-0 bg-glow-radial opacity-60 pointer-events-none" />
    <div class="absolute inset-0 dot-grid opacity-15 pointer-events-none" />

    <div class="relative max-w-3xl mx-auto animate-fade-up">
      <div class="mb-6 flex justify-center">
        <span class="badge">Nuxtaur by Scudyweb</span>
      </div>

      <h1 class="section-title mb-6">
        Bienvenue sur<br>
        <span class="text-gradient">EU_2</span>
      </h1>

      <p class="section-subtitle mx-auto mb-10 text-slate-400">
        Votre projet est prêt. Stack complet : Nuxt 4, Tailwind, Prisma, GSAP, Stripe, Cloudinary.
        Construisez quelque chose d'extraordinaire.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4">
        <UiButton to="https://scudyweb.be" variant="primary" size="lg">
          scudyweb.be
        </UiButton>
        <UiButton to="https://nuxt.com/docs" variant="secondary" size="lg">
          Documentation Nuxt
        </UiButton>
      </div>

      <!-- Stack badges -->
      <div class="mt-16 flex flex-wrap justify-center gap-3">
        <span v-for="tech in ['Nuxt 4', 'Tailwind CSS', 'Prisma', 'GSAP', 'VueUse', 'Stripe', 'Cloudinary', 'Zod']"
          :key="tech" class="badge text-xs">
          {{ tech }}
        </span>
      </div>
    </div>
  </section>
</template>
