export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
  ],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  css: [
    '@fontsource-variable/inter/index.css',
    '@fontsource-variable/syne/index.css',
    '~/assets/css/main.css',
  ],

  routeRules: {
    '/admin/**': { ssr: false },
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      websocket: true,
    },
    routeRules: {
      '/api/downloads/**': {
        headers: { 'X-Content-Type-Options': 'nosniff' },
      },
      '/**': {
        headers: {
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Content-Type-Options': 'nosniff',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
          'X-XSS-Protection': '1; mode=block',
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "media-src 'self' blob: https://res.cloudinary.com",
            "connect-src 'self' https://res.cloudinary.com ws: wss:",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      },
      '/api/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        },
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger'],
    },
  },

  runtimeConfig: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: 'Scudyweb <scudyweb@gmail.com>',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://scudyweb.be',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Scudyweb',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#020817' },
        { 'http-equiv': 'content-language', content: 'fr-BE' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'sitemap', type: 'application/xml', href: '/sitemap.xml' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },
})
