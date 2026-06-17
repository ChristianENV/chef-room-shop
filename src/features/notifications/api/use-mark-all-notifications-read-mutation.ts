'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markAllNotificationsRead } from './notifications.api'
import { notificationsQueryKeys } from './notifications.query-keys'

/**
 * Marks all visible notifications as read and invalidates notification queries.
 */
export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.listAll() })
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.unreadCount() })
    },
  })
}
