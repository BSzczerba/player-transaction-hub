<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>

<template>
  <div class="w-full max-w-lg space-y-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-slate-800">
        <span class="text-teal-500">TX</span>Hub
      </h1>
      <p class="mt-1 text-sm text-slate-500">Gaming Platform Operations</p>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-slate-800">Create an account</h2>
        <p class="mt-1 text-sm text-slate-500">
          Already have an account?
          <NuxtLink to="/login" class="text-teal-600 hover:underline font-medium">Sign in</NuxtLink>
        </p>
      </div>

      <AuthRegisterForm />
    </div>
  </div>
</template>
