<script setup lang="ts">
import type { TransactionFilterDto } from '~/types/api'

const emit = defineEmits<{ change: [TransactionFilterDto] }>()

const type = ref<'' | 'Deposit' | 'Withdrawal'>('')
const status = ref('')
const startDate = ref('')
const endDate = ref('')
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)
const isFlagged = ref(false)

const statusOptions = ['', 'Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Rejected']

function apply() {
  const filters: TransactionFilterDto = { page: 1, pageSize: 20 }
  if (type.value) filters.type = type.value
  if (status.value) filters.status = status.value
  if (startDate.value) filters.startDate = startDate.value
  if (endDate.value) filters.endDate = endDate.value
  if (minAmount.value != null && minAmount.value > 0) filters.minAmount = minAmount.value
  if (maxAmount.value != null && maxAmount.value > 0) filters.maxAmount = maxAmount.value
  if (isFlagged.value) filters.isFlagged = true
  emit('change', filters)
}

function reset() {
  type.value = ''
  status.value = ''
  startDate.value = ''
  endDate.value = ''
  minAmount.value = null
  maxAmount.value = null
  isFlagged.value = false
  emit('change', { page: 1, pageSize: 20 })
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 p-4">
    <div class="flex flex-wrap gap-3 items-end">
      <!-- Type -->
      <div class="flex flex-col gap-1 min-w-[120px]">
        <label class="text-xs font-medium text-slate-500">Type</label>
        <select
          v-model="type"
          class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All types</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdrawal">Withdrawal</option>
        </select>
      </div>

      <!-- Status -->
      <div class="flex flex-col gap-1 min-w-[130px]">
        <label class="text-xs font-medium text-slate-500">Status</label>
        <select
          v-model="status"
          class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All statuses</option>
          <option v-for="s in statusOptions.slice(1)" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Date from -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">From</label>
        <input
          v-model="startDate"
          type="date"
          class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <!-- Date to -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">To</label>
        <input
          v-model="endDate"
          type="date"
          class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <!-- Amount range -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">Min $</label>
        <input
          v-model.number="minAmount"
          type="number"
          placeholder="0"
          class="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">Max $</label>
        <input
          v-model.number="maxAmount"
          type="number"
          placeholder="∞"
          class="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <!-- Flagged toggle -->
      <div class="flex flex-col gap-1 justify-end">
        <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-600 pb-1.5">
          <input v-model="isFlagged" type="checkbox" class="rounded" />
          Flagged only
        </label>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 ml-auto items-end pb-0.5">
        <button
          class="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          @click="reset"
        >
          Reset
        </button>
        <button
          class="px-3 py-1.5 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          @click="apply"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>
