<script setup lang="ts">
interface Props {
  title?: string
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const close = () => emit('update:modelValue', false)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

// Only listen while the modal is actually open
watchEffect((onCleanup) => {
  if (!props.modelValue) return
  window.addEventListener('keydown', onKeydown)
  onCleanup(() => window.removeEventListener('keydown', onKeydown))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="close"
        />
        <!-- Panel -->
        <div class="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl p-6">
          <div v-if="title" class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
            <button
              class="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
              @click="close"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
