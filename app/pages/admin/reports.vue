<script setup lang="ts">
import type { FinancialSummaryDto, PlayerActivityReportDto, PaymentMethodReportDto } from '~/types/api'

definePageMeta({ middleware: ['auth', 'role'], roles: ['Administrator'] })

const { $api } = useNuxtApp()
const { formatUSD } = useCurrency()

// ── tabs ──────────────────────────────────────────────────────────────────────
const tabs = ['Financial Summary', 'Player Activity', 'Payment Methods', 'Export'] as const
type Tab = typeof tabs[number]
const activeTab = ref<Tab>('Financial Summary')

// Shared date range (also used by export tab)
const startDate = ref('')
const endDate = ref('')

// ── financial summary ─────────────────────────────────────────────────────────
const summary = ref<FinancialSummaryDto | null>(null)
const summaryLoading = ref(false)
const groupBy = ref<'Daily' | 'Weekly' | 'Monthly'>('Daily')

async function loadSummary() {
  summaryLoading.value = true
  try {
    summary.value = await ($api as ReturnType<typeof $fetch.create>)<FinancialSummaryDto>(
      '/api/Reports/financial-summary',
      {
        query: {
          StartDate: startDate.value || undefined,
          EndDate: endDate.value || undefined,
          GroupBy: groupBy.value,
        },
      },
    )
  } catch {
    summary.value = null
  } finally {
    summaryLoading.value = false
  }
}

// ── player activity ───────────────────────────────────────────────────────────
const playerActivity = ref<PlayerActivityReportDto | null>(null)
const activityLoading = ref(false)

async function loadActivity() {
  activityLoading.value = true
  try {
    playerActivity.value = await ($api as ReturnType<typeof $fetch.create>)<PlayerActivityReportDto>(
      '/api/Reports/players',
    )
  } catch {
    playerActivity.value = null
  } finally {
    activityLoading.value = false
  }
}

// ── payment methods ───────────────────────────────────────────────────────────
const paymentReport = ref<PaymentMethodReportDto | null>(null)
const methodsLoading = ref(false)

async function loadMethods() {
  methodsLoading.value = true
  try {
    paymentReport.value = await ($api as ReturnType<typeof $fetch.create>)<PaymentMethodReportDto>(
      '/api/Reports/payment-methods',
    )
  } catch {
    paymentReport.value = null
  } finally {
    methodsLoading.value = false
  }
}

// ── export ────────────────────────────────────────────────────────────────────
const exportingTx = ref(false)
const exportingPlayers = ref(false)

async function exportTransactions() {
  exportingTx.value = true
  try {
    const blob = await ($api as ReturnType<typeof $fetch.create>)<Blob>(
      '/api/Reports/export/transactions',
      {
        responseType: 'blob',
        query: {
          StartDate: startDate.value || undefined,
          EndDate: endDate.value || undefined,
        },
      },
    )
    triggerDownload(blob, 'transactions.csv')
  } finally {
    exportingTx.value = false
  }
}

async function exportPlayers() {
  exportingPlayers.value = true
  try {
    const blob = await ($api as ReturnType<typeof $fetch.create>)<Blob>(
      '/api/Reports/export/players',
      { responseType: 'blob' },
    )
    triggerDownload(blob, 'players.csv')
  } finally {
    exportingPlayers.value = false
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── tab switching ─────────────────────────────────────────────────────────────
watch(activeTab, tab => {
  if (tab === 'Player Activity' && !playerActivity.value) loadActivity()
  if (tab === 'Payment Methods' && !paymentReport.value) loadMethods()
})

onMounted(loadSummary)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Reports</h1>

    <!-- Tab bar -->
    <div class="flex gap-1 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="[
          'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
          activeTab === tab
            ? 'border-teal-500 text-teal-600'
            : 'border-transparent text-slate-500 hover:text-slate-700',
        ]"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- ── Financial Summary ─────────────────────────────────────────────── -->
    <template v-if="activeTab === 'Financial Summary'">
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex flex-wrap gap-3 items-end">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">From</label>
            <input
              v-model="startDate"
              type="date"
              class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">To</label>
            <input
              v-model="endDate"
              type="date"
              class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">Group By</label>
            <select
              v-model="groupBy"
              class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <button
            :disabled="summaryLoading"
            class="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            @click="loadSummary"
          >
            <svg v-if="summaryLoading" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Apply
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            @click="startDate = ''; endDate = ''; loadSummary()"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- KPI cards -->
      <div v-if="summaryLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <CommonAppStatCard label="Avg Transaction" :value="formatUSD(summary.averageTransactionAmount)" />
      </div>

      <!-- Charts row -->
      <div v-if="summary" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Line chart -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 class="text-sm font-semibold text-slate-800 mb-4">Deposits vs Withdrawals</h2>
          <ReportsFinancialChart
            v-if="summary.breakdown.length > 0"
            :breakdown="summary.breakdown"
          />
          <p v-else class="text-sm text-slate-400 text-center py-8">No breakdown data available.</p>
        </div>

        <!-- Donut chart -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h2 class="text-sm font-semibold text-slate-800 mb-4">Transaction Status</h2>
          <ReportsStatusDonutChart
            :completed="summary.completedTransactions"
            :pending="summary.pendingTransactions"
            :rejected="summary.rejectedTransactions"
            :flagged="summary.flaggedTransactions"
          />
        </div>
      </div>

      <!-- Status summary bar -->
      <div v-if="summary" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Completed</p>
          <p class="text-xl font-semibold font-mono text-green-600">{{ summary.completedTransactions }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Pending</p>
          <p class="text-xl font-semibold font-mono text-amber-600">{{ summary.pendingTransactions }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Rejected</p>
          <p class="text-xl font-semibold font-mono text-red-600">{{ summary.rejectedTransactions }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Flagged</p>
          <p class="text-xl font-semibold font-mono text-orange-600">{{ summary.flaggedTransactions }}</p>
        </div>
      </div>
    </template>

    <!-- ── Player Activity ───────────────────────────────────────────────── -->
    <template v-else-if="activeTab === 'Player Activity'">
      <div v-if="activityLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-white border border-slate-200 animate-pulse" />
      </div>
      <div v-else-if="playerActivity" class="space-y-6">
        <!-- KPI cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CommonAppStatCard label="Total Players" :value="String(playerActivity.totalPlayers)" />
          <CommonAppStatCard label="Active Players" :value="String(playerActivity.activePlayers)" />
          <CommonAppStatCard label="KYC Verified" :value="String(playerActivity.kycVerifiedPlayers)" />
          <CommonAppStatCard label="New This Period" :value="String(playerActivity.newPlayersInPeriod)" />
        </div>

        <!-- Extra stats row -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Suspended</p>
            <p class="text-xl font-semibold font-mono text-amber-600">{{ playerActivity.suspendedPlayers }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Closed</p>
            <p class="text-xl font-semibold font-mono text-red-600">{{ playerActivity.closedPlayers }}</p>
          </div>
        </div>

        <!-- Top players table -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-800">Top Players by Volume</h2>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">#</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Username</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Transactions</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Total Volume</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="(p, idx) in playerActivity.topPlayersByVolume"
                :key="p.playerId"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-4 py-3 text-slate-400 text-xs">{{ idx + 1 }}</td>
                <td class="px-4 py-3 font-medium text-slate-800">
                  <NuxtLink :to="`/admin/players/${p.playerId}`" class="hover:text-teal-600 transition-colors">
                    {{ p.username }}
                  </NuxtLink>
                </td>
                <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{{ p.transactionCount }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800 font-medium">{{ formatUSD(p.totalVolume) }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums text-teal-600">{{ formatUSD(p.currentBalance) }}</td>
              </tr>
              <tr v-if="playerActivity.topPlayersByVolume.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-slate-400 text-sm">No player data available.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-center py-12 text-slate-400 text-sm">Failed to load player activity data.</div>
    </template>

    <!-- ── Payment Methods ───────────────────────────────────────────────── -->
    <template v-else-if="activeTab === 'Payment Methods'">
      <div v-if="methodsLoading" class="h-64 rounded-xl bg-white border border-slate-200 animate-pulse" />
      <template v-else-if="paymentReport">
        <!-- Summary KPIs -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Volume</p>
            <p class="text-lg font-semibold font-mono text-slate-800">{{ formatUSD(paymentReport.totalVolume) }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Transactions</p>
            <p class="text-lg font-semibold font-mono text-slate-800">{{ paymentReport.totalTransactions }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Most Used</p>
            <p class="text-sm font-semibold text-teal-600 truncate">{{ paymentReport.mostUsedByCount || '—' }}</p>
          </div>
        </div>

        <!-- Bar chart -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 class="text-sm font-semibold text-slate-800 mb-4">Volume &amp; Count by Payment Method</h2>
          <ReportsPaymentMethodBarChart
            v-if="paymentReport.paymentMethods.length > 0"
            :items="paymentReport.paymentMethods"
          />
          <p v-else class="text-sm text-slate-400 text-center py-8">No data available.</p>
        </div>

        <!-- Stats table -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="text-sm font-semibold text-slate-800">Payment Method Breakdown</h2>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-100">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Method</th>
                <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Transactions</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Total Volume</th>
                <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="m in paymentReport.paymentMethods"
                :key="m.paymentMethodId"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-4 py-3 font-medium text-slate-800">{{ m.name }}</td>
                <td class="px-4 py-3 text-slate-500 text-xs">{{ m.type }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-700">{{ m.transactionCount }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800">{{ formatUSD(m.totalVolume) }}</td>
                <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-600">{{ formatUSD(m.averageAmount) }}</td>
              </tr>
              <tr v-if="paymentReport.paymentMethods.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-slate-400 text-sm">No payment method data.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else class="text-center py-12 text-slate-400 text-sm">Failed to load payment method data.</div>
    </template>

    <!-- ── Export ────────────────────────────────────────────────────────── -->
    <template v-else-if="activeTab === 'Export'">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        <!-- Transactions CSV -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-lg bg-teal-50">
              <svg class="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">Transactions CSV</h3>
              <p class="text-xs text-slate-500 mt-0.5">All transaction records with full details</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">From (optional)</label>
              <input
                v-model="startDate"
                type="date"
                class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">To (optional)</label>
              <input
                v-model="endDate"
                type="date"
                class="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <button
            :disabled="exportingTx"
            class="w-full py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            @click="exportTransactions"
          >
            <svg v-if="exportingTx" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ exportingTx ? 'Exporting…' : 'Download Transactions CSV' }}
          </button>
        </div>

        <!-- Players CSV -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-lg bg-sky-50">
              <svg class="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">Players CSV</h3>
              <p class="text-xs text-slate-500 mt-0.5">All player accounts with status and limits</p>
            </div>
          </div>
          <p class="text-xs text-slate-400 italic">Exports all players — no date filter needed.</p>
          <button
            :disabled="exportingPlayers"
            class="w-full mt-auto py-2 text-sm font-medium bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            @click="exportPlayers"
          >
            <svg v-if="exportingPlayers" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ exportingPlayers ? 'Exporting…' : 'Download Players CSV' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
