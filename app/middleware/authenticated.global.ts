export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  // /admin uses its own password-based auth, no user session required
  if (to.path.startsWith('/admin')) return
  if (!loggedIn.value && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
})
