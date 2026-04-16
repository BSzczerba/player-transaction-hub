export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const allowedRoles = to.meta.roles as string[] | undefined
  if (!allowedRoles) return
  if (!allowedRoles.includes(auth.user?.role ?? '')) {
    return navigateTo('/unauthorized')
  }
})
