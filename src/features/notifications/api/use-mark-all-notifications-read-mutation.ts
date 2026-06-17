'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { NotificationAudience } from '../types'
import { markAllNotificationsRead } from './notifications.api'
import { notificationsQueryKeys } from './notifications.query-keys'

/**
 * Marks all visible notifications as read and invalidates notification queries.
 */
export function useMarkAllNotificationsReadMutation(audience?: NotificationAudience) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllNotificationsRead(audience),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.listAll() })
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all })
    },
  })
}
