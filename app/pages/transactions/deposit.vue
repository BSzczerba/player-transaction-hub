<script setup lang="ts">
import type { PaymentMethodDto } from '~/types/api'

definePageMeta({ middleware: ['auth', 'role'], roles: ['Player'] })

const auth = useAuthStore()
const txStore = useTransactionStore()
const { $api } = useNuxtApp()
const { formatUSD } = useCurrency()
const router = useRouter()

const step = ref<1 | 2 | 3>(1)
const paymentMethods = ref<PaymentMethodDto[]>([])
const selectedMethod = ref<PaymentMethodDto | null>(null)
const amount = ref<number | null>(null)
const amountError = ref('')
const submitting = ref(false)
const submitError = ref('')

onMounted(async () => {
  paymentMethods.value = await ($api as ReturnType<typeof $fetch.create>)<PaymentMethodDto[]>('/api/PaymentMethods')
})

function selectMethod(m: PaymentMethodDto) {
  selectedMethod.value = m
  step.value = 2
  amount.value = null
  amountError.value = ''
}

function validateAmount(): boolean {
  if (!amount.value || amount.value <= 0) {
    amountError.value = 'Please enter a valid amount.'
    return false
  }
  const method = selectedMethod.value!
  if (amount.value < method.minAmount) {
    amountError.value = `Minimum deposit is ${formatUSD(method.minAmount)}.`
    return false
  }
  if (amount.value > method.maxAmount) {
    amountError.value = `Maximum deposit is ${formatUSD(method.maxAmount)}.`
    return false
  }
  const limit = auth.user?.dailyDepositLimit ?? Infinity
  if (amount.value > limit) {
    amountError.value = `Exceeds your daily deposit limit of ${formatUSD(limit)}.`
    return false
  }
  amountError.value = ''
  return true
}

function goToConfirm() {
  if (validateAmount()) step.value = 3
}

const fee = computed(() => {
  if (!selectedMethod.value || !amount.value) return 0
  const m = selectedMethod.value
  return m.fixedFee + (amount.value * m.feePercentage) / 100
})

const netAmount = computed(() => (amount.value ?? 0) - fee.value)

async function submit() {
  submitting.value = true
  submitError.value = ''
  try {
    const tx = await txStore.deposit({
      amount: amount.value!,
      paymentMethodId: selectedMethod.value!.id,
    })
    router.push(`/transactions/${tx.id}`)
  } catch (err: unknown) {
    submitError.value = (err as { data?: { message?: string } })?.data?.message ?? 'Deposit failed. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header + step indicator -->
    <div>
      <h1 class="text-xl font-semibold text-slate-800">Deposit Funds</h1>
      <div class="flex items-center gap-2 mt-3">
        <template v-for="n in [1, 2, 3]" :key="n">
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
            :class="step >= n ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'"
          >
            {{ n }}
          </div>
          <div v-if="n < 3" class="flex-1 h-0.5 rounded" :class="step > n ? 'bg-sky-500' : 'bg-slate-200'" />
        </template>
      </div>
      <div class="flex justify-between mt-1 text-xs text-slate-400">
        <span>Payment method</span><span>Amount</span><span>Confirm</span>
      </div>
    </div>

    <!-- Step 1: Select payment method -->
    <div v-if="step === 1" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        v-for="m in paymentMethods"
        :key="m.id"
        class="text-left rounded-xl border p-4 hover:border-sky-400 hover:shadow-sm transition-all"
        :class="m.isActive ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'"
        :disabled="!m.isActive"
        @click="selectMethod(m)"
      >
        <p class="font-medium text-slate-800">{{ m.name }}</p>
        <p class="text-xs text-slate-500 mt-1">{{ m.type }}</p>
        <div class="flex gap-4 mt-3 text-xs text-slate-500">
          <span>Fee: {{ m.feePercentage }}% + {{ formatUSD(m.fixedFee) }}</span>
          <span>~{{ m.processingTimeMinutes }} min</span>
        </div>
        <div class="text-xs text-slate-400 mt-1">
          {{ formatUSD(m.minAmount) }} – {{ formatUSD(m.maxAmount) }}
        </div>
      </button>
    </div>

    <!-- Step 2: Enter amount -->
    <div v-else-if="step === 2" class="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div class="flex items-center gap-3">
        <button class="text-slate-400 hover:text-slate-600" @click="step = 1">← Back</button>
        <span class="font-medium text-slate-700">{{ selectedMethod!.name }}</span>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Amount (USD)</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            v-model.number="amount"
            type="number"
            :min="selectedMethod!.minAmount"
            :max="selectedMethod!.maxAmount"
            class="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            placeholder="0.00"
          />
        </div>
        <p v-if="amountError" class="text-red-500 text-xs mt-1">{{ amountError }}</p>
        <p class="text-xs text-slate-400 mt-1">
          Limit: {{ formatUSD(selectedMethod!.minAmount) }} – {{ formatUSD(selectedMethod!.maxAmount) }}
          · Daily limit: {{ formatUSD(auth.user?.dailyDepositLimit ?? 0) }}
        </p>
      </div>

      <button
        class="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
        @click="goToConfirm"
      >
        Continue
      </button>
    </div>

    <!-- Step 3: Confirm -->
    <div v-else class="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
      <div class="flex items-center gap-3">
        <button class="text-slate-400 hover:text-slate-600" @click="step = 2">← Back</button>
        <span class="font-semibold text-slate-800">Confirm Deposit</span>
      </div>

      <div class="divide-y divide-slate-100">
        <div class="flex justify-between py-3 text-sm">
          <span class="text-slate-500">Payment method</span>
          <span class="font-medium">{{ selectedMethod!.name }}</span>
        </div>
        <div class="flex justify-between py-3 text-sm">
          <span class="text-slate-500">Amount</span>
          <span class="font-mono font-semibold">{{ formatUSD(amount!) }}</span>
        </div>
        <div class="flex justify-between py-3 text-sm">
          <span class="text-slate-500">Fee</span>
          <span class="font-mono text-slate-600">{{ formatUSD(fee) }}</span>
        </div>
        <div class="flex justify-between py-3 text-sm">
          <span class="text-slate-500">Net credited</span>
          <span class="font-mono font-semibold text-green-600">{{ formatUSD(netAmount) }}</span>
        </div>
        <div class="flex justify-between py-3 text-sm">
          <span class="text-slate-500">Est. processing time</span>
          <span>~{{ selectedMethod!.processingTimeMinutes }} min</span>
        </div>
      </div>

      <p v-if="submitError" class="text-red-500 text-sm">{{ submitError }}</p>

      <button
        class="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-medium transition-colors flex items-center justify-center gap-2"
        :disabled="submitting"
        @click="submit"
      >
        <svg v-if="submitting" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {{ submitting ? 'Processing...' : 'Confirm Deposit' }}
      </button>
    </div>
  </div>
</template>
