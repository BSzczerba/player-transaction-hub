<script setup lang="ts">
definePageMeta({ layout: false })

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="text-center max-w-sm px-6">
      <div class="mb-6 text-slate-300">
        <svg class="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 mb-2">403</h1>
      <p class="text-lg font-semibold text-slate-700 mb-1">Access Denied</p>
      <p class="text-sm text-slate-500 mb-8">You don't have permission to view this page.</p>
      <div class="flex flex-col gap-3">
        <button
          class="w-full px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
          @click="router.back()"
        >
          Go Back
        </button>
        <NuxtLink
          to="/"
          class="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors text-center"
        >
          Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
