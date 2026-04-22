<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const txStore = useTransactionStore()
const { formatUSD, monoClass } = useCurrency()
const { fromNow } = useRelativeTime()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    await txStore.fetchById(route.params.id as string)
  } catch {
    error.value = 'Transaction not found or you do not have access.'
  } finally {
    loading.value = false
  }
})

const tx = computed(() => txStore.currentTransaction)

const timelineSteps = computed(() => {
  if (!tx.value) return []
  const steps = [{ label: 'Created', date: tx.value.createdAt, done: true }]

  if (tx.value.approvedAt) {
    const isRejected = tx.value.status === 'Rejected'
    steps.push({
      label: isRejected ? 'Rejected' : 'Approved',
      date: tx.value.approvedAt,
      done: true,
    })
  } else if (['Rejected', 'Cancelled', 'Failed'].includes(tx.value.status)) {
    steps.push({ label: tx.value.status, date: '', done: true })
  } else {
    steps.push({ label: 'Pending Review', date: '', done: false })
  }

  if (tx.value.completedAt) {
    steps.push({ label: 'Completed', date: tx.value.completedAt, done: true })
  } else if (!['Rejected', 'Cancelled', 'Failed'].includes(tx.value.status)) {
    steps.push({ label: 'Completed', date: '', done: false })
  }

  return steps
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="h-8 bg-slate-100 rounded animate-pulse w-1/3" />
      <div class="h-40 bg-slate-100 rounded-xl animate-pulse" />
      <div class="h-32 bg-slate-100 rounded-xl animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-500 text-sm bg-red-50 rounded-xl p-6">
      {{ error }}
    </div>

    <template v-else-if="tx">
      <!-- Header -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wide mb-1">Transaction ID</p>
            <p :class="monoClass" class="text-sm text-slate-600 break-all">{{ tx.id }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="text-xs font-medium px-2 py-0.5 rounded-full"
              :class="tx.type === 'Deposit' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'"
            >
              {{ tx.type }}
            </span>
            <CommonAppBadge :status="tx.status" glow />
          </div>
        </div>
        <p :class="monoClass" class="text-4xl font-bold text-slate-900 mt-4">
          {{ formatUSD(tx.amount) }}
        </p>
        <p class="text-xs text-slate-400 mt-1">{{ fromNow(tx.createdAt) }}</p>
      </div>

      <!-- Info grid -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-4">Details</h2>
        <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt class="text-slate-400 text-xs">Player</dt>
            <dd class="font-medium text-slate-800 mt-0.5">{{ tx.playerUsername }}</dd>
          </div>
          <div>
            <dt class="text-slate-400 text-xs">Payment Method</dt>
            <dd class="font-medium text-slate-800 mt-0.5">{{ tx.paymentMethodName ?? '—' }}</dd>
          </div>
          <div v-if="tx.paymentGatewayReference">
            <dt class="text-slate-400 text-xs">Gateway Reference</dt>
            <dd :class="monoClass" class="text-xs text-slate-600 mt-0.5">{{ tx.paymentGatewayReference }}</dd>
          </div>
          <div v-if="tx.approvedByUsername">
            <dt class="text-slate-400 text-xs">Reviewed By</dt>
            <dd class="font-medium text-slate-800 mt-0.5">{{ tx.approvedByUsername }}</dd>
          </div>
          <div v-if="tx.description">
            <dt class="text-slate-400 text-xs">Description</dt>
            <dd class="text-slate-600 mt-0.5 col-span-2">{{ tx.description }}</dd>
          </div>
        </dl>
      </div>

      <!-- Balance before/after -->
      <div
        v-if="tx.balanceBefore != null && tx.balanceAfter != null"
        class="bg-white rounded-xl border border-slate-200 p-6"
      >
        <h2 class="text-sm font-semibold text-slate-700 mb-4">Balance Impact</h2>
        <div class="flex items-center gap-4">
          <div class="text-center">
            <p class="text-xs text-slate-400">Before</p>
            <p :class="monoClass" class="text-lg font-semibold text-slate-700 mt-1">
              {{ formatUSD(tx.balanceBefore) }}
            </p>
          </div>
          <div class="text-slate-400 text-xl">→</div>
          <div class="text-center">
            <p class="text-xs text-slate-400">After</p>
            <p
              :class="[monoClass, tx.balanceAfter >= tx.balanceBefore ? 'text-green-600' : 'text-red-500']"
              class="text-lg font-semibold mt-1"
            >
              {{ formatUSD(tx.balanceAfter) }}
            </p>
          </div>
          <div class="ml-2">
            <p
              :class="[monoClass, tx.balanceAfter >= tx.balanceBefore ? 'text-green-600' : 'text-red-500']"
              class="text-sm font-medium"
            >
              {{ tx.balanceAfter >= tx.balanceBefore ? '+' : '' }}{{ formatUSD(tx.balanceAfter - tx.balanceBefore) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Status timeline -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-4">Timeline</h2>
        <ol class="relative border-l border-slate-200 ml-3">
          <li
            v-for="(s, i) in timelineSteps"
            :key="i"
            class="mb-6 last:mb-0 ml-6"
          >
            <span
              class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white text-xs"
              :class="s.done ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'"
            >
              {{ s.done ? '✓' : '·' }}
            </span>
            <p class="text-sm font-medium text-slate-800">{{ s.label }}</p>
            <p v-if="s.date" class="text-xs text-slate-400 mt-0.5">{{ fromNow(s.date) }}</p>
          </li>
        </ol>
      </div>

      <!-- Flag section -->
      <div v-if="tx.isFlagged" class="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div class="flex items-start gap-3">
          <span class="text-amber-500 text-lg mt-0.5">⚑</span>
          <div>
            <p class="font-semibold text-amber-800">Transaction Flagged</p>
            <p class="text-sm text-amber-700 mt-1">{{ tx.flagReason ?? 'No reason provided.' }}</p>
          </div>
        </div>
      </div>

      <!-- Rejection section -->
      <div v-if="tx.rejectionReason" class="bg-red-50 border border-red-200 rounded-xl p-5">
        <p class="font-semibold text-red-800">Rejection Reason</p>
        <p class="text-sm text-red-700 mt-1">{{ tx.rejectionReason }}</p>
      </div>
    </template>
  </div>
</template>
