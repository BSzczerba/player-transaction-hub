import type { NotificationDto } from '~/types/api'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    // Full list — populated by fetchAll (notifications page)
    notifications: [] as NotificationDto[],
    // Unread subset — populated by fetchUnread (polling, bell icon)
    unreadNotifications: [] as NotificationDto[],
  }),

  getters: {
    unreadCount: (state): number => state.unreadNotifications.length,
  },

  actions: {
    async fetchUnread(): Promise<void> {
      try {
        const { $api } = useNuxtApp()
        const data = await ($api as ReturnType<typeof $fetch.create>)<NotificationDto[]>(
          '/api/notifications/unread'
        )
        // Guard: skip reactivity update if count hasn't changed and IDs match
        const same =
          data.length === this.unreadNotifications.length &&
          data.every((n, i) => n.id === this.unreadNotifications[i]?.id)
        if (!same) this.unreadNotifications = data
      } catch {
        // silently fail polling
      }
    },

    async fetchAll(): Promise<void> {
      const { $api } = useNuxtApp()
      this.notifications = await ($api as ReturnType<typeof $fetch.create>)<NotificationDto[]>(
        '/api/notifications'
      )
    },

    async markRead(id: string): Promise<void> {
      const { $api } = useNuxtApp()
      await ($api as ReturnType<typeof $fetch.create>)(`/api/notifications/${id}/read`, { method: 'POST' })
      const n = this.notifications.find(n => n.id === id)
      if (n) n.isRead = true
      this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== id)
    },

    async markAllRead(): Promise<void> {
      const { $api } = useNuxtApp()
      await ($api as ReturnType<typeof $fetch.create>)('/api/notifications/read-all', { method: 'POST' })
      this.notifications.forEach(n => { n.isRead = true })
      this.unreadNotifications = []
    },
  },
})
