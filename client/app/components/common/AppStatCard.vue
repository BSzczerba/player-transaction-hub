<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  subtext?: string
  icon?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="relative rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm p-5 shadow-sm flex flex-col gap-1"
  >
    <p class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ label }}</p>
    <p class="text-2xl font-semibold text-slate-900 font-mono tabular-nums">{{ value }}</p>
    <p v-if="subtext" class="text-xs text-slate-400">{{ subtext }}</p>
  </div>
</template>
