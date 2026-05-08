import type {
  TransactionDto,
  PagedResult,
  TransactionFilterDto,
  CreateDepositDto,
  CreateWithdrawalDto,
} from '~/types/api'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    myTransactions: null as PagedResult<TransactionDto> | null,       // player's own transactions
    allTransactions: null as PagedResult<TransactionDto> | null,      // staff-fetched queries
    pendingTransactions: null as PagedResult<TransactionDto> | null,
    flaggedTransactions: null as PagedResult<TransactionDto> | null,
    filters: {} as TransactionFilterDto,
    currentTransaction: null as TransactionDto | null,
  }),

  actions: {
    async fetchMy(page = 1, pageSize = 20, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc', filters: TransactionFilterDto = {}): Promise<void> {
      const api = useApi()
      const { page: _p, pageSize: _ps, sortBy: _sb, sortDir: _sd, ...rest } = filters
      this.myTransactions = await api<PagedResult<TransactionDto>>(
        '/api/Transactions/my',
        { query: { page, pageSize, sortBy, sortDir, ...rest } }
      )
    },

    async fetchAll(filters?: TransactionFilterDto): Promise<void> {
      const api = useApi()
      const params = { page: 1, pageSize: 20, ...this.filters, ...filters }
      this.allTransactions = await api<PagedResult<TransactionDto>>(
        '/api/Transactions',
        { query: params }
      )
    },

    async fetchById(id: string): Promise<void> {
      const api = useApi()
      this.currentTransaction = await api<TransactionDto>(`/api/Transactions/${id}`)
    },

    async fetchPending(page = 1, pageSize = 20): Promise<void> {
      const api = useApi()
      this.pendingTransactions = await api<PagedResult<TransactionDto>>(
        '/api/Transactions/pending',
        { query: { page, pageSize } }
      )
    },

    async fetchFlagged(page = 1, pageSize = 20): Promise<void> {
      const api = useApi()
      this.flaggedTransactions = await api<PagedResult<TransactionDto>>(
        '/api/Transactions/flagged',
        { query: { page, pageSize } }
      )
    },

    async deposit(dto: CreateDepositDto): Promise<TransactionDto> {
      const api = useApi()
      return api<TransactionDto>('/api/Transactions/deposit', { method: 'POST', body: dto })
    },

    async withdraw(dto: CreateWithdrawalDto): Promise<TransactionDto> {
      const api = useApi()
      return api<TransactionDto>('/api/Transactions/withdraw', { method: 'POST', body: dto })
    },

    async approve(id: string, notes?: string): Promise<void> {
      const api = useApi()
      await api<void>(`/api/Transactions/${id}/approve`, { method: 'POST', body: { notes } })
    },

    async reject(id: string, reason: string): Promise<void> {
      const api = useApi()
      await api<void>(`/api/Transactions/${id}/reject`, { method: 'POST', body: { reason } })
    },

    setFilters(filters: TransactionFilterDto) {
      this.filters = filters
    },
  },
})
