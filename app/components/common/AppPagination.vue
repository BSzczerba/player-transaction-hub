<script setup lang="ts">
import type { PagedResult } from '~/types/api'

interface Props {
  pagination: PagedResult<unknown> | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'page-change': [number] }>()

const prev = () => {
  if (props.pagination?.hasPreviousPage) {
    emit('page-change', (props.pagination.page ?? 1) - 1)
  }
}

const next = () => {
  if (props.pagination?.hasNextPage) {
    emit('page-change', (props.pagination.page ?? 1) + 1)
  }
}
</script>

<template>
  <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between px-2 py-3">
    <p class="text-sm text-slate-500">
      Page {{ pagination.page }} of {{ pagination.totalPages }}
      <span class="text-slate-400">({{ pagination.totalCount }} total)</span>
    </p>
    <div class="flex gap-2">
      <button
        :disabled="!pagination.hasPreviousPage"
        class="px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="prev"
      >
        Previous
      </button>
      <button
        :disabled="!pagination.hasNextPage"
        class="px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="next"
      >
        Next
      </button>
    </div>
  </div>
</template>
