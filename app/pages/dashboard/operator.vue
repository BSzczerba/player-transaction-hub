<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['Operator', 'Administrator'] })

const txStore = useTransactionStore()
const { formatUSD } = useCurrency()
const { fromNow } = useRelativeTime()

const loading = ref(true)
const approvingId = ref<string | null>(null)
const rejectingId = ref<string | null>(null)

const pendingCount = computed(() => txStore.pendingTransactions?.totalCount ?? 0)
const flaggedCount = computed(() => txStore.flaggedTransactions?.totalCount ?? 0)
const recentPending = computed(() => txStore.pendingTransactions?.items.slice(0, 10) ?? [])

async function refresh() {
  await Promise.all([txStore.fetchPending(1, 10), txStore.fetchFlagged(1, 1)])
}

onMounted(async () => {
  await refresh()
  loading.value = false
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Operator Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CommonAppStatCard label="Pending Transactions" :value="pendingCount" subtext="Awaiting review" />
      <CommonAppStatCard label="Flagged Transactions" :value="flaggedCount" subtext="Require attention" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">Pending Transactions</h2>
        <NuxtLink to="/operator/pending" class="text-xs text-teal-600 hover:text-teal-700 font-medium">
          View all →
        </NuxtLink>
      </div>

      <div v-if="loading" class="p-6 text-center text-sm text-slate-400">Loading...</div>
      <div v-else-if="recentPending.length === 0" class="p-6 text-center text-sm text-slate-400">
        No pending transactions — all caught up!
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Player</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
            <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Payment Method</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="tx in recentPending" :key="tx.id" class="hover:bg-slate-50/50 transition-colors" :class="{ 'border-l-2 border-amber-400': tx.isFlagged }">
            <td class="px-4 py-3 font-medium text-slate-800">{{ tx.playerUsername }}</td>
            <td class="px-4 py-3">
              <span :class="tx.type === 'Deposit' ? 'text-teal-600' : 'text-orange-600'" class="font-medium">
                {{ tx.type }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800">{{ formatUSD(tx.amount) }}</td>
            <td class="px-4 py-3 text-slate-500 text-xs">{{ fromNow(tx.createdAt) }}</td>
            <td class="px-4 py-3 text-slate-500">{{ tx.paymentMethodName ?? '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 justify-end">
                <button
                  class="px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded hover:bg-teal-100 transition-colors"
                  @click="approvingId = tx.id"
                >
                  Approve
                </button>
                <button
                  class="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  @click="rejectingId = tx.id"
                >
                  Reject
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TransactionsApproveModal
      v-if="approvingId"
      :model-value="!!approvingId"
      :transaction-id="approvingId"
      @update:model-value="approvingId = null"
      @approved="refresh"
    />
    <TransactionsRejectModal
      v-if="rejectingId"
      :model-value="!!rejectingId"
      :transaction-id="rejectingId"
      @update:model-value="rejectingId = null"
      @rejected="refresh"
    />
  </div>
</template>
