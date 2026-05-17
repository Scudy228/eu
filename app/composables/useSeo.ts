interface SeoOptions {
  title: string
  description: string
  image?: string
  noIndex?: boolean
  type?: 'website' | 'article'
}

export function useSeo(options: SeoOptions) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://scudyweb.be'
  const siteName = config.public.siteName || 'Scudyweb'
  const route = useRoute()

  const fullTitle = options.title.includes(siteName)
    ? options.title
    : `${options.title} | ${siteName}`

  const image = options.image || `${siteUrl}/og/default.png`
  const canonical = `${siteUrl}${route.path}`

  useSeoMeta({
    title: fullTitle,
    description: options.description,
    ogTitle: fullTitle,
    ogDescription: options.description,
    ogImage: image,
    ogUrl: canonical,
    ogType: options.type || 'website',
    ogLocale: 'fr_BE',
    ogSiteName: siteName,
    twitterCard: 'summary_large_image',
    twitterTitle: fullTitle,
    twitterDescription: options.description,
    twitterImage: image,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
    ...(options.noIndex
      ? { meta: [{ name: 'robots', content: 'noindex, nofollow' }] }
      : {}),
  })
}
