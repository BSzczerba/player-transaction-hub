<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import type { ChartOptions } from 'chart.js'

const props = defineProps<{
  completed: number
  pending: number
  rejected: number
  flagged: number
}>()

const chartData = computed(() => ({
  labels: ['Completed', 'Pending', 'Rejected', 'Flagged'],
  datasets: [
    {
      data: [props.completed, props.pending, props.rejected, props.flagged],
      backgroundColor: ['#22C55E', '#F59E0B', '#EF4444', '#F97316'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 6,
    },
  ],
}))

const options: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.label}: ${ctx.raw}`,
      },
    },
  },
}
</script>

<template>
  <div class="h-64">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>
