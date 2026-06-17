'use client'

import { useQuery } from '@tanstack/react-query'

import type { MyNotificationsInput } from '../types'
import { getMyNotifications } from './notifications.api'
import { notificationsQueryKeys } from './notifications.query-keys'

/**
 * TanStack Query hook for the authenticated user's notifications.
 */
export function useMyNotificationsQuery(input?: MyNotificationsInput) {
  return useQuery({
    queryKey: notificationsQueryKeys.list(input ?? {}),
    queryFn: () => getMyNotifications(input),
  })
}
