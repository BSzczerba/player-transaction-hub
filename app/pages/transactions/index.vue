<script setup lang="ts">
import type { TransactionDto, TransactionFilterDto } from '~/types/api'

definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const txStore = useTransactionStore()
const { formatUSD, monoClass } = useCurrency()
const { fromNow } = useRelativeTime()
const router = useRouter()

const loading = ref(true)
const loadError = ref('')
const sortBy = ref('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')
const activeFilters = ref<TransactionFilterDto>({})

const columns = [
  { key: 'createdAt', label: 'Date', width: '150px', sortable: true },
  { key: 'type', label: 'Type', width: '110px', sortable: true },
  { key: 'amount', label: 'Amount', width: '130px', sortable: true },
  { key: 'status', label: 'Status', width: '130px', sortable: true },
  { key: 'paymentMethodName', label: 'Method' },
  { key: 'paymentGatewayReference', label: 'Gateway Ref', width: '160px' },
  { key: 'isFlagged', label: 'Flag', width: '60px' },
]

async function load(page = 1) {
  loading.value = true
  loadError.value = ''
  try {
    await txStore.fetchMy(page, 20, sortBy.value, sortDir.value, activeFilters.value)
  } catch (err) {
    loadError.value = 'Failed to load transactions.'
    console.error('[transactions/index] fetchMy error:', err)
  } finally {
    loading.value = false
  }
}

function handleSortChange({ sortBy: by, sortDir: dir }: { sortBy: string; sortDir: 'asc' | 'desc' }) {
  sortBy.value = by
  sortDir.value = dir
  load(1)
}

function handleFilterChange(filters: TransactionFilterDto) {
  activeFilters.value = filters
  load(1)
}

onMounted(() => load())

function goToDetail(row: Record<string, unknown>) {
  router.push(`/transactions/${row.id}`)
}

const rows = computed(() => txStore.myTransactions?.items ?? [])
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold text-slate-800">My Transactions</h1>

    <TransactionsTransactionFilters @change="handleFilterChange" />

    <p v-if="loadError" class="text-red-500 text-sm">{{ loadError }}</p>

    <CommonAppDataTable
      :columns="columns"
      :rows="(rows as Record<string, unknown>[])"
      :loading="loading"
      :pagination="txStore.myTransactions"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :on-row-click="goToDetail"
      @page-change="load"
      @sort-change="handleSortChange"
    >
      <template #cell-createdAt="{ value }">
        <span class="text-slate-500 text-xs">{{ fromNow(value as string) }}</span>
      </template>

      <template #cell-type="{ value }">
        <span
          class="text-xs font-medium px-2 py-0.5 rounded-full"
          :class="value === 'Deposit' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'"
        >
          {{ value }}
        </span>
      </template>

      <template #cell-amount="{ value }">
        <span :class="monoClass" class="font-semibold text-slate-800">
          {{ formatUSD(value as number) }}
        </span>
      </template>

      <template #cell-status="{ value }">
        <CommonAppBadge :status="value as string" glow />
      </template>

      <template #cell-paymentMethodName="{ value }">
        <span class="text-slate-500">{{ value ?? '—' }}</span>
      </template>

      <template #cell-paymentGatewayReference="{ value }">
        <span :class="monoClass" class="text-xs text-slate-400">{{ value ?? '—' }}</span>
      </template>

      <template #cell-isFlagged="{ row, value }">
        <span
          v-if="value"
          class="text-amber-500"
          :title="(row as unknown as TransactionDto).flagReason ?? 'Flagged'"
        >
          ⚑
        </span>
      </template>
    </CommonAppDataTable>
  </div>
</template>

<style scoped>
:deep(tr:has([title])) {
  border-left: 2px solid #f59e0b;
}
</style>
