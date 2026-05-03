import type { PlayerDto, RiskProfileDto } from '~/types/api'

export const usePlayerStore = defineStore('players', {
  state: () => ({
    players: null as PlayerDto[] | null,
    selectedPlayer: null as PlayerDto | null,
    riskProfile: null as RiskProfileDto | null,
  }),

  actions: {
    async fetchAll(): Promise<void> {
      const { $api } = useNuxtApp()
      this.players = await ($api as ReturnType<typeof $fetch.create>)<PlayerDto[]>('/api/Players')
    },

    async fetchById(id: string): Promise<void> {
      const { $api } = useNuxtApp()
      this.selectedPlayer = await ($api as ReturnType<typeof $fetch.create>)<PlayerDto>(
        `/api/Players/${id}`
      )
    },

    async updateLimits(id: string, dailyDepositLimit: number, dailyWithdrawalLimit: number): Promise<void> {
      const { $api } = useNuxtApp()
      await ($api as ReturnType<typeof $fetch.create>)<void>(
        `/api/Admin/players/${id}/limits`,
        { method: 'PUT', body: { dailyDepositLimit, dailyWithdrawalLimit } }
      )
      if (this.selectedPlayer?.id === id) {
        this.selectedPlayer = { ...this.selectedPlayer, dailyDepositLimit, dailyWithdrawalLimit }
      }
    },

    async suspend(id: string): Promise<void> {
      const { $api } = useNuxtApp()
      await ($api as ReturnType<typeof $fetch.create>)<void>(
        `/api/Admin/players/${id}/suspend`,
        { method: 'POST' }
      )
      if (this.selectedPlayer?.id === id) {
        this.selectedPlayer = { ...this.selectedPlayer, status: 'Suspended' }
      }
    },

    async activate(id: string): Promise<void> {
      const { $api } = useNuxtApp()
      await ($api as ReturnType<typeof $fetch.create>)<void>(
        `/api/Admin/players/${id}/activate`,
        { method: 'POST' }
      )
      if (this.selectedPlayer?.id === id) {
        this.selectedPlayer = { ...this.selectedPlayer, status: 'Active' }
      }
    },

    async close(id: string): Promise<void> {
      const { $api } = useNuxtApp()
      await ($api as ReturnType<typeof $fetch.create>)<void>(
        `/api/Admin/players/${id}/close`,
        { method: 'POST' }
      )
      if (this.selectedPlayer?.id === id) {
        this.selectedPlayer = { ...this.selectedPlayer, status: 'Closed' }
      }
    },

    async updateRole(id: string, role: string): Promise<void> {
      const { $api } = useNuxtApp()
      const roleMap: Record<string, number> = {
        Player: 1,
        Operator: 2,
        Administrator: 3,
        ComplianceOfficer: 4,
      }
      await ($api as ReturnType<typeof $fetch.create>)<void>(
        `/api/Admin/players/${id}/role`,
        { method: 'PUT', body: { role: roleMap[role] ?? 1 } }
      )
      if (this.selectedPlayer?.id === id) {
        this.selectedPlayer = { ...this.selectedPlayer, role: role as PlayerDto['role'] }
      }
    },

    async verifyKyc(id: string): Promise<void> {
      const { $api } = useNuxtApp()
      await ($api as ReturnType<typeof $fetch.create>)<void>(
        `/api/Admin/players/${id}/kyc`,
        { method: 'POST', body: { verified: true } }
      )
      if (this.selectedPlayer?.id === id) {
        this.selectedPlayer = { ...this.selectedPlayer, kycVerified: true }
      }
    },

    async fetchRiskProfile(id: string): Promise<void> {
      const { $api } = useNuxtApp()
      this.riskProfile = await ($api as ReturnType<typeof $fetch.create>)<RiskProfileDto>(
        `/api/Compliance/players/${id}/risk`
      )
    },
  },
})
