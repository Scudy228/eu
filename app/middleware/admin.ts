export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin' || to.path === '/admin/') return
  if (import.meta.server) return

  try {
    await $fetch('/api/admin/stats', { method: 'GET' })
  } catch {
    return navigateTo('/admin', { replace: true })
  }
})
