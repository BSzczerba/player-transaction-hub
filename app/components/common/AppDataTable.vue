<script setup lang="ts">
import type { PagedResult } from '~/types/api'

interface Column {
  key: string
  label: string
  width?: string
  sortable?: boolean
}

interface Props {
  columns: Column[]
  rows: Record<string, unknown>[]
  loading?: boolean
  pagination?: PagedResult<unknown> | null
  onRowClick?: (row: Record<string, unknown>) => void
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: null,
  sortBy: '',
  sortDir: 'desc',
})

const emit = defineEmits<{
  'page-change': [number]
  'sort-change': [{ sortBy: string; sortDir: 'asc' | 'desc' }]
}>()

function handleSort(col: Column) {
  if (!col.sortable) return
  const newDir = props.sortBy === col.key && props.sortDir === 'desc' ? 'asc' : 'desc'
  emit('sort-change', { sortBy: col.key, sortDir: newDir })
}

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
              :class="{ 'cursor-pointer select-none hover:text-slate-700': col.sortable }"
              :style="col.width ? { width: col.width } : {}"
              @click="handleSort(col)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="col.sortable" class="inline-flex flex-col leading-none text-[10px]">
                  <span :class="sortBy === col.key && sortDir === 'asc' ? 'text-slate-800' : 'text-slate-300'">▲</span>
                  <span :class="sortBy === col.key && sortDir === 'desc' ? 'text-slate-800' : 'text-slate-300'">▼</span>
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Skeleton rows -->
          <template v-if="loading">
            <CommonAppSkeletonRow
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

    <CommonAppPagination
      v-if="pagination"
      :pagination="pagination"
      @page-change="emit('page-change', $event)"
    />
  </div>
</template>
