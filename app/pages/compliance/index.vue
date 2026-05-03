<script setup lang="ts">
import type { ComplianceSummaryDto } from '~/types/api'

definePageMeta({ middleware: ['auth', 'role'], roles: ['ComplianceOfficer', 'Administrator'] })

const { $api } = useNuxtApp()
const txStore = useTransactionStore()
const { formatUSD } = useCurrency()
const { fromNow } = useRelativeTime()

const summary = ref<ComplianceSummaryDto | null>(null)
const loading = ref(true)
const clearingId = ref<string | null>(null)

const flaggedItems = computed(() => txStore.flaggedTransactions?.items ?? [])

async function load() {
  loading.value = true
  try {
    const [s] = await Promise.all([
      ($api as ReturnType<typeof $fetch.create>)<ComplianceSummaryDto>('/api/Compliance/summary'),
      txStore.fetchFlagged(1, 20),
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
    <h1 class="text-xl font-semibold text-slate-800">Compliance Dashboard</h1>

    <!-- Summary cards -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-white border border-slate-200 animate-pulse" />
    </div>
    <div v-else-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CommonAppStatCard label="Flagged Transactions" :value="summary.totalFlaggedTransactions" />
      <CommonAppStatCard label="Pending Review" :value="summary.pendingReview" />
      <CommonAppStatCard label="Flagged Players" :value="summary.flaggedPlayersCount" />
      <CommonAppStatCard label="Total Flagged Amount" :value="formatUSD(summary.totalFlaggedAmount)" />
    </div>

    <!-- Flagged transactions table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">Flagged Transactions</h2>
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
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Flag Reason</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="tx in flaggedItems"
            :key="tx.id"
            class="border-l-2 border-amber-400 hover:bg-amber-50/30 transition-colors"
          >
            <td class="px-4 py-3">
              <NuxtLink :to="`/compliance/players/${tx.playerId}`" class="font-medium text-teal-600 hover:underline">
                {{ tx.playerUsername }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3">
              <span :class="tx.type === 'Deposit' ? 'text-teal-600' : 'text-orange-600'" class="font-medium">
                {{ tx.type }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800">{{ formatUSD(tx.amount) }}</td>
            <td class="px-4 py-3">
              <TransactionsTransactionStatusBadge :status="tx.status" />
            </td>
            <td class="px-4 py-3 text-slate-500 text-xs max-w-xs truncate" :title="tx.flagReason">
              {{ tx.flagReason ?? '—' }}
            </td>
            <td class="px-4 py-3 text-slate-500 text-xs">{{ fromNow(tx.createdAt) }}</td>
            <td class="px-4 py-3 text-right">
              <button
                class="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors"
                @click="clearingId = tx.id"
              >
                Clear Flag
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ComplianceClearFlagModal
      v-if="clearingId"
      :model-value="!!clearingId"
      :transaction-id="clearingId"
      @update:model-value="clearingId = null"
      @cleared="load"
    />
  </div>
</template>
