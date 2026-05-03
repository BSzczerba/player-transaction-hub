<script setup lang="ts">
import type { AuditLogDto } from '~/types/api'

definePageMeta({ middleware: ['auth', 'role'], roles: ['Administrator'] })

const { $api } = useNuxtApp()
const { fromNow } = useRelativeTime()

const logs = ref<AuditLogDto[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const dateFrom = ref('')
const dateTo = ref('')
const playerIdFilter = ref('')

async function load(p = 1) {
  loading.value = true
  try {
    const result = await ($api as ReturnType<typeof $fetch.create>)<{
      items: AuditLogDto[]
      totalPages: number
      totalCount: number
      page: number
    }>('/api/Admin/audit-logs', {
      query: {
        page: p,
        pageSize: 20,
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
        playerId: playerIdFilter.value || undefined,
      },
    })
    logs.value = result.items
    totalPages.value = result.totalPages
    totalCount.value = result.totalCount
    page.value = p
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => load(1))
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Audit Logs</h1>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">From</label>
          <input
            v-model="dateFrom"
            type="date"
            class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">To</label>
          <input
            v-model="dateTo"
            type="date"
            class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Player ID</label>
          <input
            v-model="playerIdFilter"
            type="text"
            placeholder="Filter by player ID"
            class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
          />
        </div>
        <button
          class="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          @click="load(1)"
        >
          Apply
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          @click="dateFrom = ''; dateTo = ''; playerIdFilter = ''; load(1)"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <span class="text-sm font-medium text-slate-700">Results</span>
        <span class="text-xs text-slate-500">{{ totalCount }} total</span>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-slate-400">Loading...</div>
      <div v-else-if="logs.length === 0" class="p-8 text-center text-sm text-slate-500">No audit logs found.</div>
      <template v-else>
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Action</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Entity Type</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Entity ID</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Performed By</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Change</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{{ fromNow(log.createdAt) }}</td>
              <td class="px-4 py-3 font-medium text-slate-800 text-xs">{{ log.action }}</td>
              <td class="px-4 py-3 text-slate-500 text-xs">{{ log.entityType }}</td>
              <td class="px-4 py-3 font-mono text-xs text-slate-500 max-w-24 truncate">{{ log.entityId }}</td>
              <td class="px-4 py-3 text-slate-600 text-xs">{{ log.performedByUsername }}</td>
              <td class="px-4 py-3 text-xs">
                <span v-if="log.oldValue" class="text-red-500 line-through">{{ log.oldValue }}</span>
                <span v-if="log.oldValue && log.newValue" class="text-slate-400 mx-1">→</span>
                <span v-if="log.newValue" class="text-green-600">{{ log.newValue }}</span>
                <span v-if="!log.oldValue && !log.newValue" class="text-slate-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="totalPages > 1" class="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
          <span>Page {{ page }} of {{ totalPages }}</span>
          <div class="flex gap-2">
            <button
              :disabled="page <= 1"
              class="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              @click="load(page - 1)"
            >
              Previous
            </button>
            <button
              :disabled="page >= totalPages"
              class="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs"
              @click="load(page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
