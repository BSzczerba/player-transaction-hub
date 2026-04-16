<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['Administrator'] })
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Admin Dashboard</h1>
    <p class="text-slate-500 text-sm">Phase 4 will implement this dashboard.</p>
  </div>
</template>
