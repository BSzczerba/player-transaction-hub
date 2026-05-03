<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['Operator', 'ComplianceOfficer', 'Administrator'] })

const txStore = useTransactionStore()
const { formatUSD } = useCurrency()
const { fromNow } = useRelativeTime()

const page = ref(1)
const loading = ref(true)
const approvingId = ref<string | null>(null)
const rejectingId = ref<string | null>(null)

const result = computed(() => txStore.flaggedTransactions)
const items = computed(() => result.value?.items ?? [])

const auth = useAuthStore()
const canApproveReject = computed(() => ['Operator', 'Administrator'].includes(auth.user?.role ?? ''))

async function load(p = page.value) {
  loading.value = true
  try {
    await txStore.fetchFlagged(p)
    page.value = p
  } finally {
    loading.value = false
  }
}

async function onAction() {
  await load(page.value)
}

onMounted(() => load(1))
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-slate-800">Flagged Transactions</h1>
      <span v-if="result" class="text-sm text-slate-500">{{ result.totalCount }} total</span>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading && items.length === 0" class="p-8 text-center text-sm text-slate-400">Loading...</div>
      <div v-else-if="!loading && items.length === 0" class="p-10 text-center">
        <p class="text-slate-500 font-medium">No flagged transactions.</p>
      </div>
      <template v-else>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Player</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Flag Reason</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="tx in items"
              :key="tx.id"
              class="border-l-2 border-amber-400 hover:bg-amber-50/30 transition-colors"
            >
              <td class="px-4 py-3">
                <NuxtLink :to="`/admin/players/${tx.playerId}`" class="font-medium text-teal-600 hover:underline">
                  {{ tx.playerUsername }}
                </NuxtLink>
              </td>
              <td class="px-4 py-3">
                <span :class="tx.type === 'Deposit' ? 'text-teal-600' : 'text-orange-600'" class="font-medium">
                  {{ tx.type }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800">{{ formatUSD(tx.amount) }}</td>
              <td class="px-4 py-3 text-slate-500 text-xs max-w-xs truncate" :title="tx.flagReason">
                {{ tx.flagReason ?? '—' }}
              </td>
              <td class="px-4 py-3 text-slate-500 text-xs">{{ fromNow(tx.createdAt) }}</td>
              <td class="px-4 py-3">
                <div v-if="canApproveReject" class="flex items-center gap-2 justify-end">
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
        <div v-if="result && result.totalPages > 1" class="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
          <span>Page {{ result.page }} of {{ result.totalPages }}</span>
          <div class="flex gap-2">
            <button
              :disabled="!result.hasPreviousPage"
              class="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              @click="load(page - 1)"
            >
              Previous
            </button>
            <button
              :disabled="!result.hasNextPage"
              class="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              @click="load(page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </template>
    </div>

    <TransactionsApproveModal
      v-if="approvingId"
      :model-value="!!approvingId"
      :transaction-id="approvingId"
      @update:model-value="approvingId = null"
      @approved="onAction"
    />
    <TransactionsRejectModal
      v-if="rejectingId"
      :model-value="!!rejectingId"
      :transaction-id="rejectingId"
      @update:model-value="rejectingId = null"
      @rejected="onAction"
    />
  </div>
</template>
