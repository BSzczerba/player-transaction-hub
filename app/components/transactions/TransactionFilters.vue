<script setup lang="ts">
import type { TransactionFilterDto } from '~/types/api'

const emit = defineEmits<{ change: [TransactionFilterDto] }>()

const type = ref<number | ''>('')
const status = ref<number | ''>('')
const startDate = ref('')
const endDate = ref('')
const minAmount = ref<number | null>(null)
const maxAmount = ref<number | null>(null)
const isFlagged = ref(false)

const typeOptions = [
  { label: 'All types', value: '' },
  { label: 'Deposit', value: 1 },
  { label: 'Withdrawal', value: 2 },
]

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Pending', value: 1 },
  { label: 'Processing', value: 2 },
  { label: 'Completed', value: 3 },
  { label: 'Failed', value: 4 },
  { label: 'Cancelled', value: 5 },
  { label: 'Rejected', value: 6 },
]

function build(): TransactionFilterDto {
  const f: TransactionFilterDto = { page: 1, pageSize: 20 }
  if (type.value !== '') f.type = type.value as number
  if (status.value !== '') f.status = status.value as number
  if (startDate.value) f.startDate = `${startDate.value}T00:00:00Z`
  if (endDate.value) f.endDate = `${endDate.value}T23:59:59Z`
  if (minAmount.value != null && minAmount.value > 0) f.minAmount = minAmount.value
  if (maxAmount.value != null && maxAmount.value > 0) f.maxAmount = maxAmount.value
  if (isFlagged.value) f.isFlagged = true
  return f
}

function apply() {
  emit('change', build())
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
          <option v-for="o in typeOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <!-- Status -->
      <div class="flex flex-col gap-1 min-w-[130px]">
        <label class="text-xs font-medium text-slate-500">Status</label>
        <select
          v-model="status"
          class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option v-for="o in statusOptions" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
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

      <!-- Min amount -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">Min $</label>
        <input
          v-model.number="minAmount"
          type="number"
          min="0"
          placeholder="0"
          class="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <!-- Max amount -->
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-500">Max $</label>
        <input
          v-model.number="maxAmount"
          type="number"
          min="0"
          placeholder="∞"
          class="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <!-- Flagged -->
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
