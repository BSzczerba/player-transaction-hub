declare module '#app' {
  interface NuxtApp {
    $api: typeof $fetch
  }
}

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const ui = useUiStore()
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    async onRequest({ options }) {
      if (auth.token && auth.isTokenExpiringSoon) {
        await auth.refresh()
      }
      if (auth.token) {
        options.headers = new Headers(options.headers as HeadersInit)
        ;(options.headers as Headers).set('Authorization', `Bearer ${auth.token}`)
      }
    },
    onResponseError({ response }) {
      // Only auto-logout on 401 if we had a token (authenticated request rejected)
      if (response.status === 401 && auth.token) {
        auth.logout()
        navigateTo('/login')
      }
      if (response.status === 429) {
        ui.globalError = 'Too many requests. Please wait a moment and try again.'
      }
    },
  })

  return {
    provide: { api }
  }
})
