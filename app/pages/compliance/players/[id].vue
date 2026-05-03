<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['ComplianceOfficer', 'Administrator'] })

const route = useRoute()
const id = route.params.id as string

const playerStore = usePlayerStore()
const { formatUSD } = useCurrency()
const { fromNow } = useRelativeTime()

const loading = ref(true)
const error = ref('')
const clearingId = ref<string | null>(null)

const profile = computed(() => playerStore.riskProfile)

async function load() {
  loading.value = true
  error.value = ''
  try {
    await playerStore.fetchRiskProfile(id)
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'Failed to load risk profile.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function statusClass(status: string) {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    Suspended: 'bg-amber-100 text-amber-700',
    Closed: 'bg-red-100 text-red-700',
    PendingActivation: 'bg-slate-100 text-slate-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-2 text-sm text-slate-500">
      <NuxtLink to="/compliance" class="hover:text-teal-600 transition-colors">Compliance</NuxtLink>
      <span>/</span>
      <span class="text-slate-800">Risk Profile</span>
    </div>

    <div v-if="loading" class="p-8 text-center text-sm text-slate-400">Loading...</div>
    <div v-else-if="error" class="p-8 text-center text-sm text-red-500">{{ error }}</div>
    <template v-else-if="profile">
      <!-- Header -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-xl font-semibold text-slate-800">@{{ profile.username }}</h1>
            <div class="flex items-center gap-2 mt-3">
              <span class="text-xs font-medium px-2 py-1 rounded-full" :class="statusClass(profile.status)">
                {{ profile.status }}
              </span>
              <span
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="profile.kycVerified ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'"
              >
                KYC {{ profile.kycVerified ? 'Verified' : 'Unverified' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              Account created: {{ new Date(profile.accountCreated).toLocaleDateString() }}
            </p>
          </div>
          <NuxtLink
            :to="`/admin/players/${id}`"
            class="text-xs text-teal-600 hover:text-teal-700 font-medium border border-teal-200 px-3 py-1.5 rounded-md hover:bg-teal-50 transition-colors"
          >
            View Admin Profile →
          </NuxtLink>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div class="text-center">
            <p class="text-2xl font-semibold font-mono tabular-nums text-slate-900">{{ profile.totalTransactions }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Total Tx</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-semibold font-mono tabular-nums text-amber-600">{{ profile.flaggedTransactions }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Flagged</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold font-mono tabular-nums text-teal-700">{{ formatUSD(profile.totalDeposited) }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Total Deposited</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold font-mono tabular-nums text-orange-600">{{ formatUSD(profile.totalWithdrawn) }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Total Withdrawn</p>
          </div>
          <div class="text-center">
            <p class="text-lg font-semibold font-mono tabular-nums text-slate-900">{{ formatUSD(profile.currentBalance) }}</p>
            <p class="text-xs text-slate-500 mt-0.5">Balance</p>
          </div>
        </div>
      </div>

      <!-- Recent flagged transactions -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-800">Recent Flagged Transactions</h2>
        </div>
        <div v-if="!profile.recentFlaggedTransactions?.length" class="p-8 text-center text-sm text-slate-500">
          No flagged transactions for this player.
        </div>
        <table v-else class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
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
              v-for="tx in profile.recentFlaggedTransactions"
              :key="tx.id"
              class="border-l-2 border-amber-400 hover:bg-amber-50/30 transition-colors"
            >
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
    </template>
    <div v-else class="p-8 text-center text-sm text-slate-500">
      Risk profile not found.
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
