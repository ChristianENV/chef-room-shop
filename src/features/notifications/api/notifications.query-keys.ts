import type { MyNotificationsInput } from '../types'

export const notificationsQueryKeys = {
  all: ['notifications'] as const,
  list: (input: MyNotificationsInput = {}) =>
    [...notificationsQueryKeys.all, 'list', input] as const,
  listAll: () => [...notificationsQueryKeys.all, 'list'] as const,
  unreadCount: () => [...notificationsQueryKeys.all, 'unread-count'] as const,
}
