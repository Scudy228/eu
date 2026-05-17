export function useScrollAnimation() {
  const nuxtApp = useNuxtApp()

  function revealOnScroll(
    el: string | Ref<HTMLElement | null>,
    options: Record<string, any> = {}
  ) {
    if (import.meta.server) return
    const { $gsap } = nuxtApp as any
    nextTick(() => {
      const target = typeof el === 'string' ? el : (el.value as HTMLElement)
      if (!target) return
      $gsap.from(target, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: 'power3.out',
        ...options,
        scrollTrigger: {
          trigger: target,
          start: 'top 85%',
          once: true,
          ...(options.scrollTrigger || {}),
        },
      })
    })
  }

  function staggerReveal(
    container: string | Ref<HTMLElement | null>,
    childSelector: string,
    options: Record<string, any> = {}
  ) {
    if (import.meta.server) return
    const { $gsap } = nuxtApp as any
    nextTick(() => {
      const parent = typeof container === 'string' ? container : (container.value as HTMLElement)
      if (!parent) return
      const selector = typeof parent === 'string'
        ? `${parent} ${childSelector}`
        : childSelector
      $gsap.from(selector, {
        opacity: 0,
        y: 60,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: parent,
          start: 'top 80%',
          once: true,
        },
        ...options,
      })
    })
  }

  return { revealOnScroll, staggerReveal }
}
