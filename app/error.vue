<script setup lang="ts">
defineProps<{
  error: {
    statusCode: number
    statusMessage: string
    message: string
  }
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-navy-950 flex items-center justify-center p-6">
    <div class="absolute inset-0 bg-glow-radial opacity-50 pointer-events-none" />
    <div class="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

    <div class="relative text-center max-w-lg">
      <div class="font-display font-bold text-[120px] lg:text-[160px] leading-none text-gradient opacity-30 mb-4">
        {{ error.statusCode }}
      </div>

      <div class="-mt-8 mb-8">
        <h1 class="font-display font-bold text-3xl text-white mb-4">
          {{ error.statusCode === 404 ? 'Page introuvable' : 'Une erreur est survenue' }}
        </h1>
        <p class="text-slate-400 leading-relaxed">
          {{ error.statusCode === 404
            ? 'La page que vous cherchez n\'existe pas ou a été déplacée.'
            : error.statusMessage || 'Quelque chose s\'est mal passé. Veuillez réessayer.' }}
        </p>
      </div>

      <UiButton variant="primary" @click="handleError">
        Retour à l'accueil
      </UiButton>
    </div>
  </div>
</template>
