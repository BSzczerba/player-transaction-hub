<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
if (auth.token) {
  const redirectMap: Record<string, string> = {
    Player: '/dashboard/player',
    Operator: '/dashboard/operator',
    Administrator: '/dashboard/admin',
    ComplianceOfficer: '/compliance',
  }
  navigateTo(redirectMap[auth.user?.role ?? ''] ?? '/')
}
</script>

<template>
  <div class="w-full max-w-md space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-2xl font-bold text-slate-800">
        <span class="text-teal-500">TX</span>Hub
      </h1>
      <p class="mt-1 text-sm text-slate-500">Gaming Platform Operations</p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-slate-800">Sign in to your account</h2>
        <p class="mt-1 text-sm text-slate-500">
          Don't have an account?
          <NuxtLink to="/register" class="text-teal-600 hover:underline font-medium">Register</NuxtLink>
        </p>
      </div>

      <AuthLoginForm />

      <p class="text-xs text-slate-400 text-center">
        <button type="button" class="hover:text-slate-600 cursor-not-allowed opacity-60" disabled>
          Forgot password?
        </button>
      </p>
    </div>

    <AuthDevLoginBanner />
  </div>
</template>
