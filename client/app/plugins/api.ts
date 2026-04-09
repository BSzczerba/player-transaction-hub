export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const ui = useUiStore()

  const api = $fetch.create({
    baseURL: 'http://localhost:5235',
    onRequest({ options }) {
      if (auth.token) {
        options.headers = new Headers(options.headers as HeadersInit)
        ;(options.headers as Headers).set('Authorization', `Bearer ${auth.token}`)
      }
      if (auth.isTokenExpiringSoon) {
        auth.refresh()
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
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
