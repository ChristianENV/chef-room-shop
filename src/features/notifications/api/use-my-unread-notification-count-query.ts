'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyUnreadNotificationCount } from './notifications.api'
import { notificationsQueryKeys } from './notifications.query-keys'

export const NOTIFICATIONS_POLL_INTERVAL_MS = 60_000

type UnreadCountQueryOptions = {
  enabled?: boolean
  refetchInterval?: number | false
}

/**
 * TanStack Query hook for unread in-app notification count.
 */
export function useMyUnreadNotificationCountQuery(
  options: UnreadCountQueryOptions = {},
) {
  const { enabled = true, refetchInterval = NOTIFICATIONS_POLL_INTERVAL_MS } = options

  return useQuery({
    queryKey: notificationsQueryKeys.unreadCount(),
    queryFn: getMyUnreadNotificationCount,
    enabled,
    refetchInterval: enabled ? refetchInterval : false,
  })
}
