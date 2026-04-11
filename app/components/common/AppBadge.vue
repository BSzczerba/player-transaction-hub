<script setup lang="ts">
interface Props {
  status: string
  glow?: boolean
}

const props = withDefaults(defineProps<Props>(), { glow: false })

const variantMap: Record<string, { classes: string; glowClass: string }> = {
  Pending: {
    classes: 'text-amber-600 bg-amber-50 border border-amber-300',
    glowClass: 'shadow-[0_0_8px_rgba(245,158,11,0.3)]',
  },
  Processing: {
    classes: 'text-sky-600 bg-sky-50 border border-sky-300',
    glowClass: '',
  },
  Completed: {
    classes: 'text-green-600 bg-green-50 border border-green-300',
    glowClass: 'shadow-[0_0_8px_rgba(34,197,94,0.3)]',
  },
  Failed: {
    classes: 'text-red-600 bg-red-50 border border-red-300',
    glowClass: '',
  },
  Cancelled: {
    classes: 'text-slate-600 bg-slate-50 border border-slate-300',
    glowClass: '',
  },
  Rejected: {
    classes: 'text-red-600 bg-red-50 border border-red-300',
    glowClass: '',
  },
}

const defaultVariant = variantMap['Pending']!

const variant = computed(() => variantMap[props.status] ?? defaultVariant)

const classes = computed(() =>
  [
    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
    variant.value.classes,
    props.glow ? variant.value.glowClass : '',
  ].join(' ')
)
</script>

<template>
  <span :class="classes">{{ status }}</span>
</template>
