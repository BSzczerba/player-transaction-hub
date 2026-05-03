<script setup lang="ts">
import { Toaster } from '~/components/ui/toast'
// Session restored by plugins/auth-init.ts before route middleware runs
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>
