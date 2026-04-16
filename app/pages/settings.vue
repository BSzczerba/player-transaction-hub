<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const auth = useAuthStore()
const { formatUSD } = useCurrency()
</script>

<template>
  <div class="max-w-lg mx-auto space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Settings</h1>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">Daily Limits</h2>

      <div class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Daily deposit limit</span>
          <span class="font-mono font-medium text-slate-800">
            {{ auth.user ? formatUSD(auth.user.dailyDepositLimit) : '—' }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Daily withdrawal limit</span>
          <span class="font-mono font-medium text-slate-800">
            {{ auth.user ? formatUSD(auth.user.dailyWithdrawalLimit) : '—' }}
          </span>
        </div>
      </div>

      <p class="text-xs text-slate-400 pt-2">
        Contact support to change your daily limits.
      </p>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">Verification Status</h2>

      <div class="space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Email verified</span>
          <span :class="auth.user?.emailVerified ? 'text-green-600' : 'text-red-500'" class="font-medium">
            {{ auth.user?.emailVerified ? 'Verified' : 'Not verified' }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">Phone verified</span>
          <span :class="auth.user?.phoneVerified ? 'text-green-600' : 'text-red-500'" class="font-medium">
            {{ auth.user?.phoneVerified ? 'Verified' : 'Not verified' }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">KYC verified</span>
          <span :class="auth.user?.kycVerified ? 'text-green-600' : 'text-red-500'" class="font-medium">
            {{ auth.user?.kycVerified ? 'Verified' : 'Not verified' }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">Notification Preferences</h2>
      <p class="text-sm text-slate-400">Notification preferences — coming soon.</p>
    </div>
  </div>
</template>
