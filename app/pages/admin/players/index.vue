<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['Administrator'] })

const playerStore = usePlayerStore()
const { formatUSD } = useCurrency()

const search = ref('')
const loading = ref(true)

const allItems = computed(() => playerStore.players ?? [])

const items = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return allItems.value
  return allItems.value.filter(p =>
    p.username?.toLowerCase().includes(q) ||
    p.email?.toLowerCase().includes(q) ||
    p.firstName?.toLowerCase().includes(q) ||
    p.lastName?.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  await playerStore.fetchAll()
  loading.value = false
})

function statusClass(status: string) {
  const map: Record<string, string> = {
    Active: 'bg-green-100 text-green-700',
    Suspended: 'bg-amber-100 text-amber-700',
    Closed: 'bg-red-100 text-red-700',
    PendingActivation: 'bg-slate-100 text-slate-600',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-slate-800">Players</h1>
      <span v-if="!loading" class="text-sm text-slate-500">{{ allItems.length }} total</span>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100">
        <input
          v-model="search"
          type="text"
          placeholder="Search by username, email, or name..."
          class="w-full max-w-xs rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-slate-400">Loading...</div>
      <div v-else-if="items.length === 0" class="p-8 text-center text-sm text-slate-500">
        No players found.
      </div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Username</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Email</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Role</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
            <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Balance</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">KYC</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="p in items"
            :key="p.id"
            class="hover:bg-slate-50/50 transition-colors cursor-pointer"
            @click="navigateTo(`/admin/players/${p.id}`)"
          >
            <td class="px-4 py-3 font-medium text-teal-700">{{ p.username }}</td>
            <td class="px-4 py-3 text-slate-600">{{ p.email }}</td>
            <td class="px-4 py-3 text-slate-500 text-xs">{{ p.role }}</td>
            <td class="px-4 py-3">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="statusClass(p.status)">
                {{ p.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-right font-mono tabular-nums text-slate-800">{{ formatUSD(p.balance) }}</td>
            <td class="px-4 py-3">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="p.kycVerified ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ p.kycVerified ? 'Verified' : 'Pending' }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-500 text-xs">{{ new Date(p.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
