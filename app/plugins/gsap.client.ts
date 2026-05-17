import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin({
  name: 'gsap',
  setup() {
    gsap.registerPlugin(ScrollTrigger)

    gsap.defaults({
      ease: 'power3.out',
      duration: 0.8,
    })

    const router = useRouter()
    router.afterEach(() => {
      nextTick(() => ScrollTrigger.refresh())
    })

    return {
      provide: { gsap, ScrollTrigger },
    }
  },
})
