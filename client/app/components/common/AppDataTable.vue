<script setup lang="ts">
import type { PagedResult } from '~/types/api'

interface Column {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: Column[]
  rows: Record<string, unknown>[]
  loading?: boolean
  pagination?: PagedResult<unknown> | null
  onRowClick?: (row: Record<string, unknown>) => void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: null,
})

const emit = defineEmits<{ 'page-change': [number] }>()

const skeletonRows = 5
</script>

<template>
  <div class="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              :style="col.width ? { width: col.width } : {}"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton rows -->
          <template v-if="loading">
            <AppSkeletonRow
              v-for="i in skeletonRows"
              :key="i"
              :columns="columns"
            />
          </template>

          <!-- Empty state -->
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-slate-400">
              No results found
            </td>
          </tr>

          <!-- Data rows -->
          <template v-else>
            <tr
              v-for="(row, idx) in rows"
              :key="idx"
              class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
              :class="{ 'cursor-pointer': !!onRowClick }"
              @click="onRowClick?.(row)"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-slate-700"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  {{ row[col.key] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <AppPagination
      v-if="pagination"
      :pagination="pagination"
      @page-change="emit('page-change', $event)"
    />
  </div>
</template>
