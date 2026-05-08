export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const allowedRoles = to.meta.roles as string[] | undefined
  if (!allowedRoles) return
  // Token present but user not loaded = degraded state — force re-auth
  if (!auth.user) return navigateTo('/login')
  if (!allowedRoles.includes(auth.user.role)) {
    return navigateTo('/unauthorized')
  }
})
