<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['Player'] })
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Player Dashboard</h1>
    <p class="text-slate-500 text-sm">Phase 3 will implement this dashboard.</p>
  </div>
</template>
