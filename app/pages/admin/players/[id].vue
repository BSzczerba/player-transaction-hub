<script setup lang="ts">
import type { AuditLogDto, TransactionFilterDto } from '~/types/api'
import { toast } from '~/components/ui/toast'

definePageMeta({ middleware: ['auth', 'role'], roles: ['Administrator'] })

const route = useRoute()
const id = route.params.id as string

const { $api } = useNuxtApp()
const playerStore = usePlayerStore()
const txStore = useTransactionStore()
const { formatUSD } = useCurrency()
const { fromNow } = useRelativeTime()

const activeTab = ref<'profile' | 'transactions' | 'audit' | 'risk'>('profile')

const loading = ref(true)
const roleLoading = ref(false)
const kycLoading = ref(false)
const selectedRole = ref('')

// Audit log state
const auditLogs = ref<AuditLogDto[]>([])
const auditLoading = ref(false)

// Transactions tab state
const txPage = ref(1)
const txLoading = ref(false)

const player = computed(() => playerStore.selectedPlayer)
const riskProfile = computed(() => playerStore.riskProfile)
const txResult = computed(() => txStore.myTransactions)

async function loadPlayer() {
  await playerStore.fetchById(id)
  selectedRole.value = player.value?.role ?? ''
}

async function loadAuditLogs() {
  auditLoading.value = true
  try {
    auditLogs.value = await ($api as ReturnType<typeof $fetch.create>)<AuditLogDto[]>(
      `/api/Admin/players/${id}/audit-logs`
    )
  } catch {
    auditLogs.value = []
  } finally {
    auditLoading.value = false
  }
}

async function loadTx(p = 1) {
  txLoading.value = true
  try {
    await txStore.fetchAll({ playerId: id, page: p, pageSize: 20 } as TransactionFilterDto)
    txPage.value = p
  } finally {
    txLoading.value = false
  }
}

async function loadRisk() {
  await playerStore.fetchRiskProfile(id)
}

async function setTab(tab: typeof activeTab.value) {
  activeTab.value = tab
  if (tab === 'audit' && auditLogs.value.length === 0) await loadAuditLogs()
  if (tab === 'transactions') await loadTx(1)
  if (tab === 'risk') await loadRisk()
}

async function updateRole() {
  if (!selectedRole.value || selectedRole.value === player.value?.role) return
  roleLoading.value = true
  try {
    await playerStore.updateRole(id, selectedRole.value)
    toast({ title: 'Role updated', description: `Player role set to ${selectedRole.value}.` })
  } catch (e: any) {
    toast({ title: 'Error', description: e?.data?.message ?? 'Failed to update role.', variant: 'destructive' })
  } finally {
    roleLoading.value = false
  }
}

async function verifyKyc() {
  kycLoading.value = true
  try {
    await playerStore.verifyKyc(id)
    toast({ title: 'KYC verified', description: 'Player KYC status has been verified.' })
  } catch (e: any) {
    toast({ title: 'Error', description: e?.data?.message ?? 'Failed to verify KYC.', variant: 'destructive' })
  } finally {
    kycLoading.value = false
  }
}

onMounted(async () => {
  playerStore.riskProfile = null
  await loadPlayer()
  loading.value = false
})

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
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-slate-500">
      <NuxtLink to="/admin/players" class="hover:text-teal-600 transition-colors">Players</NuxtLink>
      <span>/</span>
      <span class="text-slate-800">{{ player?.username ?? id }}</span>
    </div>

    <div v-if="loading" class="p-8 text-center text-sm text-slate-400">Loading...</div>
    <template v-else-if="player">
      <!-- Header -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-xl font-semibold text-slate-800">{{ player.firstName }} {{ player.lastName }}</h1>
            <p class="text-sm text-slate-500 mt-0.5">@{{ player.username }} · {{ player.email }}</p>
            <div class="flex items-center gap-2 mt-3">
              <span class="text-xs font-medium px-2 py-1 rounded-full" :class="statusClass(player.status)">
                {{ player.status }}
              </span>
              <span
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="player.kycVerified ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'"
              >
                KYC {{ player.kycVerified ? 'Verified' : 'Unverified' }}
              </span>
              <span class="text-xs text-slate-400">{{ player.role }}</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-semibold font-mono tabular-nums text-slate-900">{{ formatUSD(player.balance) }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Balance</p>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="flex border-b border-slate-100">
          <button
            v-for="tab in (['profile', 'transactions', 'audit', 'risk'] as const)"
            :key="tab"
            class="px-5 py-3 text-sm font-medium capitalize transition-colors"
            :class="activeTab === tab
              ? 'border-b-2 border-teal-500 text-teal-700 -mb-px'
              : 'text-slate-500 hover:text-slate-800'"
            @click="setTab(tab)"
          >
            {{ tab === 'audit' ? 'Audit Log' : tab === 'risk' ? 'Risk Profile' : tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </div>

        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'" class="p-6 space-y-6">
          <AdminPlayerStatusActions :player="player" @changed="loadPlayer" />
          <hr class="border-slate-100" />
          <AdminPlayerLimitsForm :player="player" @updated="loadPlayer" />
          <hr class="border-slate-100" />

          <!-- Role -->
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Role Management</p>
            <div class="flex items-center gap-3">
              <select
                v-model="selectedRole"
                class="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Player">Player</option>
                <option value="Operator">Operator</option>
                <option value="ComplianceOfficer">ComplianceOfficer</option>
                <option value="Administrator">Administrator</option>
              </select>
              <button
                :disabled="roleLoading || selectedRole === player.role"
                class="px-3 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                @click="updateRole"
              >
                <svg v-if="roleLoading" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Save Role
              </button>
            </div>
          </div>

          <hr class="border-slate-100" />

          <!-- KYC -->
          <div class="space-y-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">KYC Verification</p>
            <div class="flex items-center gap-3">
              <span
                class="text-sm font-medium"
                :class="player.kycVerified ? 'text-teal-700' : 'text-slate-500'"
              >
                {{ player.kycVerified ? 'KYC Verified' : 'Not yet verified' }}
              </span>
              <button
                v-if="!player.kycVerified"
                :disabled="kycLoading"
                class="px-3 py-1.5 text-sm font-medium bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                @click="verifyKyc"
              >
                <svg v-if="kycLoading" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verify KYC
              </button>
            </div>
          </div>
        </div>

        <!-- Transactions Tab -->
        <div v-else-if="activeTab === 'transactions'" class="p-0">
          <div v-if="txLoading && !txResult" class="p-8 text-center text-sm text-slate-400">Loading...</div>
          <div v-else-if="txResult && txResult.items.length === 0" class="p-8 text-center text-sm text-slate-500">
            No transactions found.
          </div>
          <template v-else-if="txResult">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                  <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Amount</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Payment</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="tx in txResult.items"
                  :key="tx.id"
                  class="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  :class="{ 'border-l-2 border-amber-400': tx.isFlagged }"
                  @click="navigateTo(`/transactions/${tx.id}`)"
                >
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ fromNow(tx.createdAt) }}</td>
                  <td class="px-4 py-3">
                    <span :class="tx.type === 'Deposit' ? 'text-teal-600' : 'text-orange-600'" class="font-medium">
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800">{{ formatUSD(tx.amount) }}</td>
                  <td class="px-4 py-3">
                    <TransactionsTransactionStatusBadge :status="tx.status" />
                  </td>
                  <td class="px-4 py-3 text-slate-500">{{ tx.paymentMethodName ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="txResult.totalPages > 1" class="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
              <span>Page {{ txResult.page }} of {{ txResult.totalPages }}</span>
              <div class="flex gap-2">
                <button
                  :disabled="!txResult.hasPreviousPage"
                  class="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                  @click="loadTx(txPage - 1)"
                >
                  Previous
                </button>
                <button
                  :disabled="!txResult.hasNextPage"
                  class="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                  @click="loadTx(txPage + 1)"
                >
                  Next
                </button>
              </div>
            </div>
          </template>
          <div v-else class="p-8 text-center">
            <button
              class="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              @click="loadTx(1)"
            >
              Load transactions
            </button>
          </div>
        </div>

        <!-- Audit Log Tab -->
        <div v-else-if="activeTab === 'audit'" class="p-0">
          <div v-if="auditLoading && auditLogs.length === 0" class="p-8 text-center text-sm text-slate-400">Loading...</div>
          <div v-else-if="!auditLoading && auditLogs.length === 0" class="p-8 text-center text-sm text-slate-500">
            No audit logs for this player.
          </div>
          <template v-else>
            <table class="w-full text-sm">
              <thead class="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Action</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Entity</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">By</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Change</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ fromNow(log.createdAt) }}</td>
                  <td class="px-4 py-3 font-medium text-slate-800 text-xs">{{ log.action }}</td>
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ log.entityType }}</td>
                  <td class="px-4 py-3 text-slate-500 text-xs">{{ log.performedByUsername }}</td>
                  <td class="px-4 py-3 text-xs">
                    <span v-if="log.oldValue" class="text-red-500 line-through">{{ log.oldValue }}</span>
                    <span v-if="log.oldValue && log.newValue" class="text-slate-400 mx-1">→</span>
                    <span v-if="log.newValue" class="text-green-600">{{ log.newValue }}</span>
                    <span v-if="!log.oldValue && !log.newValue" class="text-slate-400">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>
        </div>

        <!-- Risk Profile Tab -->
        <div v-else-if="activeTab === 'risk'" class="p-6">
          <div v-if="!riskProfile" class="p-4 text-center">
            <button class="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium" @click="loadRisk">
              Load risk profile
            </button>
          </div>
          <div v-else class="space-y-6">
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div class="text-center">
                <p class="text-2xl font-semibold font-mono text-slate-900">{{ riskProfile.totalTransactions }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Total Tx</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-semibold font-mono text-amber-600">{{ riskProfile.flaggedTransactions }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Flagged</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-semibold font-mono text-teal-700">{{ formatUSD(riskProfile.totalDeposited) }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Deposited</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-semibold font-mono text-orange-600">{{ formatUSD(riskProfile.totalWithdrawn) }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Withdrawn</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-semibold font-mono text-slate-900">{{ formatUSD(riskProfile.currentBalance) }}</p>
                <p class="text-xs text-slate-500 mt-0.5">Balance</p>
              </div>
            </div>

            <div v-if="riskProfile.recentFlaggedTransactions.length > 0">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Recent Flagged Transactions</p>
              <table class="w-full text-sm">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="text-left px-3 py-2 text-xs font-medium text-slate-500">Type</th>
                    <th class="text-right px-3 py-2 text-xs font-medium text-slate-500">Amount</th>
                    <th class="text-left px-3 py-2 text-xs font-medium text-slate-500">Status</th>
                    <th class="text-left px-3 py-2 text-xs font-medium text-slate-500">Flag Reason</th>
                    <th class="text-left px-3 py-2 text-xs font-medium text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="tx in riskProfile.recentFlaggedTransactions"
                    :key="tx.id"
                    class="border-l-2 border-amber-400"
                  >
                    <td class="px-3 py-2">
                      <span :class="tx.type === 'Deposit' ? 'text-teal-600' : 'text-orange-600'" class="font-medium text-xs">
                        {{ tx.type }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-right font-mono tabular-nums text-xs text-slate-800">{{ formatUSD(tx.amount) }}</td>
                    <td class="px-3 py-2">
                      <TransactionsTransactionStatusBadge :status="tx.status" />
                    </td>
                    <td class="px-3 py-2 text-slate-500 text-xs">{{ tx.flagReason ?? '—' }}</td>
                    <td class="px-3 py-2 text-slate-500 text-xs">{{ fromNow(tx.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-slate-500">No flagged transactions for this player.</div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="p-8 text-center text-sm text-slate-500">Player not found.</div>
  </div>
</template>
