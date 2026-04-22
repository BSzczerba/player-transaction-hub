<script setup lang="ts">
import type { TransactionDto } from '~/types/api'

definePageMeta({ middleware: ['auth', 'role'], roles: ['Player'] })

const auth = useAuthStore()
const txStore = useTransactionStore()
const { formatUSD, monoClass } = useCurrency()
const { fromNow } = useRelativeTime()
const router = useRouter()

const loading = ref(true)

const recentCols = [
  { key: 'createdAt', label: 'Date', width: '160px' },
  { key: 'type', label: 'Type', width: '100px' },
  { key: 'amount', label: 'Amount', width: '120px' },
  { key: 'status', label: 'Status', width: '120px' },
  { key: 'paymentMethodName', label: 'Method' },
]

onMounted(async () => {
  await txStore.fetchMy(1, 5)
  loading.value = false
})

const recent = computed(() => txStore.myTransactions?.items ?? [])

const totalDeposited = computed(() =>
  (txStore.myTransactions?.items ?? [])
    .filter((t: TransactionDto) => t.type === 'Deposit' && t.status === 'Completed')
    .reduce((sum: number, t: TransactionDto) => sum + t.amount, 0)
)

const totalWithdrawn = computed(() =>
  (txStore.myTransactions?.items ?? [])
    .filter((t: TransactionDto) => t.type === 'Withdrawal' && t.status === 'Completed')
    .reduce((sum: number, t: TransactionDto) => sum + t.amount, 0)
)

const pendingCount = computed(() =>
  (txStore.myTransactions?.items ?? []).filter((t: TransactionDto) => t.status === 'Pending').length
)

function goToDetail(row: Record<string, unknown>) {
  router.push(`/transactions/${row.id}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">
          Welcome back, {{ auth.user?.firstName ?? auth.user?.username }}
        </h1>
        <p class="text-sm text-slate-500 mt-0.5">Here's your account overview</p>
      </div>
      <div class="flex gap-3">
        <NuxtLink to="/transactions/deposit">
          <button class="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors">
            Deposit
          </button>
        </NuxtLink>
        <NuxtLink to="/transactions/withdraw">
          <button class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium transition-colors">
            Withdraw
          </button>
        </NuxtLink>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CommonAppStatCard label="Current Balance" :value="formatUSD(auth.user?.balance ?? 0)" icon="💰" />
      <CommonAppStatCard label="Total Deposited" :value="formatUSD(totalDeposited)" icon="↓" />
      <CommonAppStatCard label="Total Withdrawn" :value="formatUSD(totalWithdrawn)" icon="↑" />
      <CommonAppStatCard label="Pending Transactions" :value="String(pendingCount)" icon="⏳" />
    </div>

    <!-- Recent transactions -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">Recent Transactions</h2>
        <NuxtLink to="/transactions" class="text-sm text-sky-600 hover:underline">View all →</NuxtLink>
      </div>

      <CommonAppDataTable
        :columns="recentCols"
        :rows="(recent as Record<string, unknown>[])"
        :loading="loading"
        :pagination="null"
        :on-row-click="goToDetail"
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
      </CommonAppDataTable>
    </div>
  </div>
</template>
