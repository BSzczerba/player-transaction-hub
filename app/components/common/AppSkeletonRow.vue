<script setup lang="ts">
interface Props {
  columns: { key: string; width?: string }[]
}

defineProps<Props>()
</script>

<template>
  <tr class="animate-pulse">
    <td
      v-for="col in columns"
      :key="col.key"
      class="px-4 py-3"
    >
      <div
        class="h-4 rounded-sm bg-slate-200"
        :style="{ width: col.width ?? '75%' }"
      />
    </td>
  </tr>
</template>
