<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuthStore()

const redirectMap: Record<string, string> = {
  Player: '/dashboard/player',
  Operator: '/dashboard/operator',
  Administrator: '/dashboard/admin',
  ComplianceOfficer: '/compliance',
}

if (!auth.token) {
  navigateTo('/login')
} else {
  navigateTo(redirectMap[auth.user?.role ?? ''] ?? '/login')
}
</script>

<template>
  <div />
</template>
