<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const notifications = useNotificationStore()
const { fromNow } = useRelativeTime()

const loading = ref(false)
const markingAll = ref(false)

onMounted(async () => {
  loading.value = true
  await notifications.fetchAll()
  loading.value = false
})

async function markAll() {
  markingAll.value = true
  await notifications.markAllRead()
  markingAll.value = false
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-slate-800">Notifications</h1>
      <button
        class="text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
        :disabled="markingAll"
        @click="markAll"
      >
        Mark all as read
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
        <div class="h-4 bg-slate-200 rounded w-1/3 mb-2" />
        <div class="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="notifications.notifications.length === 0" class="bg-white rounded-xl border border-slate-200 p-10 text-center">
      <p class="text-slate-400 text-sm">No notifications yet.</p>
    </div>

    <!-- List -->
    <ul v-else class="space-y-2">
      <li
        v-for="n in notifications.notifications"
        :key="n.id"
        class="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-start gap-4 transition-colors"
        :class="!n.isRead ? 'border-l-2 border-l-sky-500' : ''"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-800" :class="!n.isRead ? 'font-semibold' : ''">
            {{ n.title }}
          </p>
          <p class="text-sm text-slate-500 mt-0.5">{{ n.message }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ fromNow(n.createdAt) }}</p>
        </div>
        <button
          v-if="!n.isRead"
          class="text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0 mt-0.5"
          @click="notifications.markRead(n.id)"
        >
          Mark read
        </button>
      </li>
    </ul>
  </div>
</template>
