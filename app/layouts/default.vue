<template>
  <div class="min-h-screen flex flex-col bg-navy-950">
    <!-- Navigation -->
    <header class="sticky top-0 z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-xl">
      <div class="container-custom flex items-center justify-between h-16">
        <NuxtLink to="/" class="font-display font-bold text-xl text-gradient">
          Scudyweb
        </NuxtLink>
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink to="/" class="text-slate-400 hover:text-white transition-colors text-sm font-medium">
            Accueil
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/5 py-8">
      <div class="container-custom text-center">
        <p class="text-slate-500 text-sm">
          © {{ new Date().getFullYear() }}
          <a href="https://scudyweb.be" target="_blank" class="text-electric-400 hover:text-electric-300 transition-colors">
            Scudyweb
          </a>
          — Tous droits réservés.
        </p>
      </div>
    </footer>
  </div>
</template>
