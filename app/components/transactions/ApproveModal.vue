<script setup lang="ts">
import { toast } from '~/components/ui/toast'

interface Props {
  modelValue: boolean
  transactionId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  approved: []
}>()

const txStore = useTransactionStore()
const notes = ref('')
const loading = ref(false)
const error = ref('')

function close() {
  emit('update:modelValue', false)
  notes.value = ''
  error.value = ''
}

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await txStore.approve(props.transactionId, notes.value || undefined)
    toast({ title: 'Transaction approved', description: 'The transaction has been approved successfully.' })
    emit('approved')
    close()
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'Failed to approve transaction.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CommonAppModal :model-value="modelValue" title="Approve Transaction" @update:model-value="close">
    <div class="space-y-4">
      <p class="text-sm text-slate-600">
        Confirm approval of transaction <span class="font-mono text-xs text-slate-800">{{ transactionId }}</span>.
      </p>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Notes <span class="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          v-model="notes"
          rows="3"
          placeholder="Add any internal notes..."
          class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex justify-end gap-2 pt-1">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          @click="submit"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Approve
        </button>
      </div>
    </div>
  </CommonAppModal>
</template>
