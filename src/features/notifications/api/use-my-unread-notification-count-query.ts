'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyUnreadNotificationCount } from './notifications.api'
import { notificationsQueryKeys } from './notifications.query-keys'

/**
 * TanStack Query hook for unread in-app notification count.
 */
export function useMyUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount(),
    queryFn: getMyUnreadNotificationCount,
  })
}
