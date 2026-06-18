'use client'

import { useQuery } from '@tanstack/react-query'

import type { MyNotificationsInput } from '../types'
import { getMyNotifications } from './notifications.api'
import { notificationsQueryKeys } from './notifications.query-keys'

type NotificationsQueryOptions = {
  enabled?: boolean
  refetchInterval?: number | false
  refetchOnMount?: boolean | 'always'
}

/**
 * TanStack Query hook for the authenticated user's notifications.
 */
export function useMyNotificationsQuery(
  input?: MyNotificationsInput,
  options: NotificationsQueryOptions = {},
) {
  const {
    enabled = true,
    refetchInterval = false,
    refetchOnMount,
  } = options

  return useQuery({
    queryKey: notificationsQueryKeys.list(input ?? {}),
    queryFn: () => getMyNotifications(input),
    enabled,
    refetchInterval: enabled ? refetchInterval : false,
    refetchOnMount,
  })
}
