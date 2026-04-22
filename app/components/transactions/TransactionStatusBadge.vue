<script setup lang="ts">
defineProps<{ status: string; glow?: boolean }>()
</script>

<template>
  <CommonAppBadge :status="status" :glow="glow" />
</template>
