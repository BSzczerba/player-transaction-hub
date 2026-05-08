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
        const api = useApi()
        this.unreadNotifications = await api<NotificationDto[]>('/api/notifications/unread')
      } catch {
        // silently fail polling
      }
    },

    async fetchAll(): Promise<void> {
      const api = useApi()
      this.notifications = await api<NotificationDto[]>('/api/notifications')
    },

    async markRead(id: string): Promise<void> {
      const api = useApi()
      await api(`/api/notifications/${id}/read`, { method: 'POST' })
      const n = this.notifications.find(n => n.id === id)
      if (n) n.isRead = true
      this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== id)
    },

    async markAllRead(): Promise<void> {
      const api = useApi()
      await api('/api/notifications/read-all', { method: 'POST' })
      this.notifications.forEach(n => { n.isRead = true })
      this.unreadNotifications = []
    },
  },
})
