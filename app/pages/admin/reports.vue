<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['Administrator'] })
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-slate-800">Reports</h1>
    <p class="text-slate-500 text-sm">Charts and export functionality will be implemented in Phase 5.</p>
  </div>
</template>
