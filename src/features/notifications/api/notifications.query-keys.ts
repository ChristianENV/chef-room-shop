import type { MyNotificationsInput, NotificationAudience } from '../types'

export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  list: (input: MyNotificationsInput = {}) =>
    [...notificationsQueryKeys.all, 'list', input] as const,
  listAll: () => [...notificationsQueryKeys.all, 'list'] as const,
  unreadCount: (audience?: NotificationAudience) =>
    [...notificationsQueryKeys.all, 'unread-count', audience ?? 'all'] as const,
}
