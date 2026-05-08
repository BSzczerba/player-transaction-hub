import type { PlayerDto, LoginDto } from '~/types/api'

type TokenData = { token: string; refreshToken: string; expiresAt: string; user: PlayerDto }

// Single in-flight refresh promise to prevent parallel token exchanges
let refreshPromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as PlayerDto | null,
    token: null as string | null,
    refreshToken: null as string | null, // memory-only — never persisted to localStorage
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
      this.refreshToken = data.refreshToken // kept in memory only
      this.expiresAt = data.expiresAt
      this.user = data.user
      if (import.meta.client) {
        // refreshToken intentionally excluded — storing it in localStorage is an XSS risk
        localStorage.setItem('token', data.token)
        localStorage.setItem('expiresAt', data.expiresAt)
      }
    },

    async login(dto: LoginDto): Promise<void> {
      const api = useApi()
      const data = await api<TokenData>('/api/auth/login', { method: 'POST', body: dto })
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
        localStorage.removeItem('expiresAt')
      }
      // Clear cross-store state to prevent data leakage between sessions
      useTransactionStore().$reset()
      usePlayerStore().$reset()
      useNotificationStore().$reset()
    },

    async refresh(): Promise<void> {
      if (!this.token || !this.refreshToken) return
      // Return existing in-flight refresh to avoid parallel token exchanges
      if (refreshPromise) return refreshPromise
      const config = useRuntimeConfig()
      const tokenSnapshot = this.token
      const refreshTokenSnapshot = this.refreshToken
      refreshPromise = (async () => {
        try {
          // Use raw $fetch (not $api) to bypass the interceptor and avoid a refresh loop
          const data = await $fetch<TokenData>(
            `${config.public.apiBase}/api/auth/refresh`,
            { method: 'POST', body: { token: tokenSnapshot, refreshToken: refreshTokenSnapshot } }
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
        const expiresAt = localStorage.getItem('expiresAt')
        if (!token || !expiresAt || new Date(expiresAt).getTime() < Date.now()) {
          this.logout()
          return
        }
        this.token = token
        this.expiresAt = expiresAt
        // refreshToken is NOT read from localStorage — it was never stored there
      }
      if (!this.token) return
      try {
        const api = useApi()
        this.user = await api<PlayerDto>('/api/auth/me')
      } catch {
        // Any failure (401, network error, etc.) invalidates the session
        this.logout()
      }
    },
  },
})
