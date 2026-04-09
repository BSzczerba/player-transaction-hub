import type { TransactionDto, PagedResult, TransactionFilterDto } from '~/types/api'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    myTransactions: null as PagedResult<TransactionDto> | null,
    pendingTransactions: null as PagedResult<TransactionDto> | null,
    flaggedTransactions: null as PagedResult<TransactionDto> | null,
    filters: {} as TransactionFilterDto,
    currentTransaction: null as TransactionDto | null,
  }),
})
