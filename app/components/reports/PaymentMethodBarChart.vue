<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartOptions } from 'chart.js'
import type { PaymentMethodStatsDto } from '~/types/api'

const props = defineProps<{
  items: PaymentMethodStatsDto[]
}>()

const chartData = computed(() => ({
  labels: props.items.map(i => i.name),
  datasets: [
    {
      label: 'Transaction Count',
      data: props.items.map(i => i.transactionCount),
      backgroundColor: 'rgba(14, 165, 233, 0.7)',
      borderColor: '#0EA5E9',
      borderWidth: 1,
      borderRadius: 4,
      yAxisID: 'yCount',
    },
    {
      label: 'Total Volume ($)',
      data: props.items.map(i => i.totalVolume),
      backgroundColor: 'rgba(20, 184, 166, 0.7)',
      borderColor: '#14B8A6',
      borderWidth: 1,
      borderRadius: 4,
      yAxisID: 'yVolume',
    },
  ],
}))

const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: ctx =>
          ctx.datasetIndex === 1
            ? ` Volume: $${Number(ctx.raw).toLocaleString()}`
            : ` Count: ${ctx.raw}`,
      },
    },
  },
  scales: {
    yCount: {
      type: 'linear',
      position: 'left',
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { stepSize: 1 },
    },
    yVolume: {
      type: 'linear',
      position: 'right',
      beginAtZero: true,
      grid: { display: false },
      ticks: { callback: value => `$${Number(value).toLocaleString()}` },
    },
    x: { grid: { display: false } },
  },
}
</script>

<template>
  <div class="h-64">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
