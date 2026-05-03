<script setup lang="ts">
import type { PlayerDto } from '~/types/api'
import { toast } from '~/components/ui/toast'

interface Props {
  player: PlayerDto
}

const props = defineProps<Props>()
const emit = defineEmits<{ changed: [] }>()

const playerStore = usePlayerStore()
const loading = ref<string | null>(null)
const error = ref('')

async function runAction(action: 'activate' | 'suspend' | 'close') {
  loading.value = action
  error.value = ''
  try {
    await playerStore[action](props.player.id)
    toast({ title: 'Player updated', description: `Player has been ${action}d.` })
    emit('changed')
  } catch (e: any) {
    error.value = e?.data?.message ?? e?.message ?? `Failed to ${action} player.`
  } finally {
    loading.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Status Actions</p>

    <div v-if="player.status === 'Closed'" class="text-sm text-slate-400 italic">
      Account closed — no actions available.
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <template v-if="player.status === 'PendingActivation'">
        <button
          :disabled="loading === 'activate'"
          class="px-3 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          @click="runAction('activate')"
        >
          <svg v-if="loading === 'activate'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Activate
        </button>
      </template>

      <template v-else-if="player.status === 'Active'">
        <button
          :disabled="loading === 'suspend'"
          class="px-3 py-1.5 text-sm font-medium bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          @click="runAction('suspend')"
        >
          <svg v-if="loading === 'suspend'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Suspend
        </button>
        <button
          :disabled="loading === 'close'"
          class="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          @click="runAction('close')"
        >
          <svg v-if="loading === 'close'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Close Account
        </button>
      </template>

      <template v-else-if="player.status === 'Suspended'">
        <button
          :disabled="loading === 'activate'"
          class="px-3 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          @click="runAction('activate')"
        >
          <svg v-if="loading === 'activate'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Reactivate
        </button>
        <button
          :disabled="loading === 'close'"
          class="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          @click="runAction('close')"
        >
          <svg v-if="loading === 'close'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Close Account
        </button>
      </template>
    </div>

    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>
