<script setup lang="ts">
const isDev = import.meta.dev
const auth = useAuthStore()
const loading = ref<string | null>(null)
const error = ref('')

const accounts = [
  { role: 'Player', email: 'player@test.com', password: 'TestPass123!', label: 'Player' },
  { role: 'Operator', email: 'operator@test.com', password: 'TestPass123!', label: 'Operator' },
  { role: 'Compliance', email: 'compliance@test.com', password: 'TestPass123!', label: 'Compliance' },
  { role: 'Administrator', email: 'admin@test.com', password: 'TestPass123!', label: 'Admin' },
]

const redirectMap: Record<string, string> = {
  Player: '/dashboard/player',
  Operator: '/dashboard/operator',
  Administrator: '/dashboard/admin',
  ComplianceOfficer: '/compliance',
}

async function loginAs(account: typeof accounts[number]) {
  loading.value = account.role
  error.value = ''
  try {
    await auth.login({ emailOrUsername: account.email, password: account.password })
    const role = auth.user?.role ?? ''
    await navigateTo(redirectMap[role] ?? '/dashboard/player')
  } catch (err: unknown) {
    const msg = (err as { data?: { message?: string } })?.data?.message
    error.value = msg ?? `Login failed (status ${(err as { status?: number })?.status ?? '?'})`
  } finally {
    loading.value = null
  }
}
</script>

<template>
  <div v-if="isDev" class="bg-slate-800 border border-slate-600 rounded-xl p-4 space-y-3">
    <p class="text-xs font-semibold text-slate-300 tracking-widest uppercase">Dev Quick Login</p>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="account in accounts"
        :key="account.role"
        type="button"
        class="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors disabled:opacity-50"
        :disabled="loading !== null"
        @click="loginAs(account)"
      >
        <svg v-if="loading === account.role" class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Login as {{ account.label }}
      </button>
    </div>
    <p v-if="error" class="text-xs text-red-400 bg-red-900/30 rounded px-2 py-1">{{ error }}</p>
  </div>
</template>
