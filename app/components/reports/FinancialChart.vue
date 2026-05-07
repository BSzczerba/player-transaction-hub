<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartOptions } from 'chart.js'

const props = defineProps<{
  breakdown: { period: string; deposits: number; withdrawals: number }[]
}>()

const chartData = computed(() => ({
  labels: props.breakdown.map(b => {
    // `period` may be ISO date "2026-05-01", ISO datetime, or a label like "Week 18"
    const d = new Date(b.period)
    if (!isNaN(d.getTime())) {
      return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
    }
    return b.period
  }),
  datasets: [
    {
      label: 'Deposits',
      data: props.breakdown.map(b => b.deposits),
      borderColor: '#14B8A6',
      backgroundColor: 'rgba(20, 184, 166, 0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
    },
    {
      label: 'Withdrawals',
      data: props.breakdown.map(b => b.withdrawals),
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
    },
  ],
}))

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.dataset.label}: $${Number(ctx.raw).toLocaleString()}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: value => `$${Number(value).toLocaleString()}`,
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    x: {
      grid: { display: false },
    },
  },
}
</script>

<template>
  <div class="h-64">
    <Line :data="chartData" :options="options" />
  </div>
</template>
