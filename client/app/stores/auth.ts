import type { PlayerDto, LoginDto } from '~/types/api'

type TokenData = { token: string; refreshToken: string; expiresAt: string; user: PlayerDto }

// Single in-flight refresh promise to prevent parallel token exchanges
let refreshPromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as PlayerDto | null,
    token: null as string | null,
    refreshToken: null as string | null,
    expiresAt: null as string | null,
  }),

  getters: {
    isTokenExpiringSoon: (state): boolean => {
      if (!state.expiresAt) return false
      return new Date(state.expiresAt).getTime() - Date.now() < 60_000
    },
  },

  actions: {
    _applyTokenData(data: TokenData) {
      this.token = data.token
      this.refreshToken = data.refreshToken
      this.expiresAt = data.expiresAt
      this.user = data.user
      if (import.meta.client) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('expiresAt', data.expiresAt)
      }
    },

    async login(dto: LoginDto): Promise<void> {
      const { $api } = useNuxtApp()
      const data = await ($api as ReturnType<typeof $fetch.create>)<TokenData>(
        '/api/auth/login',
        { method: 'POST', body: dto }
      )
      this._applyTokenData(data)
    },

    logout() {
      this.token = null
      this.refreshToken = null
      this.expiresAt = null
      this.user = null
      refreshPromise = null
      if (import.meta.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('expiresAt')
      }
    },

    async refresh(): Promise<void> {
      if (!this.token || !this.refreshToken) return
      // Return existing in-flight refresh to avoid parallel token exchanges
      if (refreshPromise) return refreshPromise
      refreshPromise = (async () => {
        try {
          const { $api } = useNuxtApp()
          const data = await ($api as ReturnType<typeof $fetch.create>)<TokenData>(
            '/api/auth/refresh',
            { method: 'POST', body: { token: this.token, refreshToken: this.refreshToken } }
          )
          this._applyTokenData(data)
        } catch {
          this.logout()
        } finally {
          refreshPromise = null
        }
      })()
      return refreshPromise
    },

    async loadUser(): Promise<void> {
      if (import.meta.client) {
        const token = localStorage.getItem('token')
        if (token) {
          this.token = token
          this.refreshToken = localStorage.getItem('refreshToken')
          this.expiresAt = localStorage.getItem('expiresAt')
        }
      }
      if (!this.token) return
      try {
        const { $api } = useNuxtApp()
        this.user = await ($api as ReturnType<typeof $fetch.create>)<PlayerDto>('/api/auth/me')
      } catch (err: unknown) {
        // Only sign out on auth failure, not transient network errors
        if ((err as { status?: number })?.status === 401) this.logout()
      }
    },
  },
})
