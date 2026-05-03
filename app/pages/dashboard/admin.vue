<script setup lang="ts">
import type { FinancialSummaryDto } from '~/types/api'

definePageMeta({ middleware: ['auth', 'role'], roles: ['Administrator'] })

const { $api } = useNuxtApp()
const txStore = useTransactionStore()
const { formatUSD } = useCurrency()
const { fromNow } = useRelativeTime()

const summary = ref<FinancialSummaryDto | null>(null)
const loading = ref(true)

const flaggedItems = computed(() => txStore.flaggedTransactions?.items.slice(0, 5) ?? [])

async function load() {
  loading.value = true
  try {
    const [s] = await Promise.all([
      ($api as ReturnType<typeof $fetch.create>)<FinancialSummaryDto>('/api/Reports/financial-summary'),
      txStore.fetchFlagged(1, 5),
    ])
    summary.value = s
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Admin Dashboard</h1>

    <!-- KPI cards -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-white border border-slate-200 animate-pulse" />
    </div>
    <div v-else-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CommonAppStatCard label="Total Deposits" :value="formatUSD(summary.totalDeposits)" />
      <CommonAppStatCard label="Total Withdrawals" :value="formatUSD(summary.totalWithdrawals)" />
      <CommonAppStatCard
        label="Net Flow"
        :value="formatUSD(summary.netFlow)"
        :subtext="summary.netFlow >= 0 ? 'Positive' : 'Negative'"
      />
      <CommonAppStatCard label="Avg Transaction" :value="formatUSD(summary.avgTransaction)" />
    </div>

    <!-- Status summary row -->
    <div v-if="summary" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Completed</p>
        <p class="text-xl font-semibold font-mono text-green-600">{{ summary.completedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Pending</p>
        <p class="text-xl font-semibold font-mono text-amber-600">{{ summary.pendingCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Rejected</p>
        <p class="text-xl font-semibold font-mono text-red-600">{{ summary.rejectedCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Flagged</p>
        <p class="text-xl font-semibold font-mono text-orange-600">{{ summary.flaggedCount }}</p>
      </div>
    </div>

    <!-- Recent flagged transactions -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">Recent Flagged Transactions</h2>
        <NuxtLink to="/operator/flagged" class="text-xs text-teal-600 hover:text-teal-700 font-medium">
          View all →
        </NuxtLink>
      </div>
      <div v-if="loading" class="p-6 text-center text-sm text-slate-400">Loading...</div>
      <div v-else-if="flaggedItems.length === 0" class="p-8 text-center text-sm text-slate-500">
        No flagged transactions.
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Player</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
            <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Flag Reason</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="tx in flaggedItems"
            :key="tx.id"
            class="border-l-2 border-amber-400 hover:bg-amber-50/30 transition-colors"
          >
            <td class="px-4 py-3 font-medium text-slate-800">{{ tx.playerUsername }}</td>
            <td class="px-4 py-3">
              <span :class="tx.type === 'Deposit' ? 'text-teal-600' : 'text-orange-600'" class="font-medium">
                {{ tx.type }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800">{{ formatUSD(tx.amount) }}</td>
            <td class="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{{ tx.flagReason ?? '—' }}</td>
            <td class="px-4 py-3 text-slate-500 text-xs">{{ fromNow(tx.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
