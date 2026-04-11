import type { PlayerDto, PagedResult, RiskProfileDto } from '~/types/api'

export const usePlayerStore = defineStore('players', {
  state: () => ({
    players: null as PagedResult<PlayerDto> | null,
    selectedPlayer: null as PlayerDto | null,
    riskProfile: null as RiskProfileDto | null,
  }),
})
