<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'role'], roles: ['ComplianceOfficer', 'Administrator'] })

onMounted(() => navigateTo('/compliance', { replace: true }))
</script>

<template>
  <div class="p-8 text-center text-sm text-slate-400">Redirecting...</div>
</template>
