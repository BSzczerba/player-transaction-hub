<script setup lang="ts">
import type { PlayerDto } from '~/types/api'
import { toast } from '~/components/ui/toast'

interface Props {
  player: PlayerDto
}

const props = defineProps<Props>()
const emit = defineEmits<{ updated: [] }>()

const playerStore = usePlayerStore()
const { formatUSD } = useCurrency()

const depositLimit = ref(props.player.dailyDepositLimit)
const withdrawalLimit = ref(props.player.dailyWithdrawalLimit)
const loading = ref(false)
const error = ref('')

watch(() => props.player, (p) => {
  depositLimit.value = p.dailyDepositLimit
  withdrawalLimit.value = p.dailyWithdrawalLimit
})

async function save() {
  if (depositLimit.value <= 0 || withdrawalLimit.value <= 0) {
    error.value = 'Limits must be greater than 0.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await playerStore.updateLimits(props.player.id, depositLimit.value, withdrawalLimit.value)
    toast({ title: 'Limits updated', description: 'Daily transaction limits have been saved.' })
    emit('updated')
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'Failed to update limits.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Daily Transaction Limits</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Daily Deposit Limit</label>
        <input
          v-model.number="depositLimit"
          type="number"
          min="1"
          step="100"
          class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <p class="text-xs text-slate-400 mt-1">Current: {{ formatUSD(player.dailyDepositLimit) }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Daily Withdrawal Limit</label>
        <input
          v-model.number="withdrawalLimit"
          type="number"
          min="1"
          step="100"
          class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <p class="text-xs text-slate-400 mt-1">Current: {{ formatUSD(player.dailyWithdrawalLimit) }}</p>
      </div>
    </div>

    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>

    <button
      :disabled="loading"
      class="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
      @click="save"
    >
      <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Save Limits
    </button>
  </div>
</template>
