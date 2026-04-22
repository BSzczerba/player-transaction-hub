<script setup lang="ts">
import type { TransactionDto } from '~/types/api'

definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const txStore = useTransactionStore()
const { formatUSD, monoClass } = useCurrency()
const { fromNow } = useRelativeTime()
const router = useRouter()

const loading = ref(true)
const loadError = ref('')

const isPlayer = computed(() => auth.user?.role === 'Player')

const columns = [
  { key: 'createdAt', label: 'Date', width: '150px' },
  { key: 'type', label: 'Type', width: '110px' },
  { key: 'amount', label: 'Amount', width: '130px' },
  { key: 'status', label: 'Status', width: '130px' },
  { key: 'paymentMethodName', label: 'Method' },
  { key: 'paymentGatewayReference', label: 'Gateway Ref', width: '160px' },
  { key: 'isFlagged', label: 'Flag', width: '60px' },
]

async function load(page = 1) {
  loading.value = true
  loadError.value = ''
  try {
    await txStore.fetchMy(page)
  } catch (err) {
    loadError.value = 'Failed to load transactions.'
    console.error('[transactions/index] fetchMy error:', err)
  } finally {
    loading.value = false
  }
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

    <p v-if="loadError" class="text-red-500 text-sm">{{ loadError }}</p>

    <CommonAppDataTable
      :columns="columns"
      :rows="(rows as Record<string, unknown>[])"
      :loading="loading"
      :pagination="txStore.myTransactions"
      :on-row-click="goToDetail"
      @page-change="load"
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
