<script setup lang="ts">
import { toast } from '~/components/ui/toast'

interface Props {
  modelValue: boolean
  transactionId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [boolean]
  rejected: []
}>()

const txStore = useTransactionStore()
const reason = ref('')
const loading = ref(false)
const error = ref('')
const validationError = ref('')

function close() {
  emit('update:modelValue', false)
  reason.value = ''
  error.value = ''
  validationError.value = ''
}

async function submit() {
  validationError.value = ''
  if (reason.value.trim().length < 10) {
    validationError.value = 'Reason must be at least 10 characters.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await txStore.reject(props.transactionId, reason.value.trim())
    toast({ title: 'Transaction rejected', description: 'The transaction has been rejected.' })
    emit('rejected')
    close()
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? 'Failed to reject transaction.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <CommonAppModal :model-value="modelValue" title="Reject Transaction" @update:model-value="close">
    <div class="space-y-4">
      <p class="text-sm text-slate-600">
        Reject transaction <span class="font-mono text-xs text-slate-800">{{ transactionId }}</span>.
        This action cannot be undone.
      </p>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Reason <span class="text-red-500">*</span></label>
        <textarea
          v-model="reason"
          rows="3"
          placeholder="Provide a reason for rejection (min. 10 characters)..."
          class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          :class="{ 'border-red-400': validationError }"
        />
        <p v-if="validationError" class="text-xs text-red-600 mt-1">{{ validationError }}</p>
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
          class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          @click="submit"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Reject
        </button>
      </div>
    </div>
  </CommonAppModal>
</template>
