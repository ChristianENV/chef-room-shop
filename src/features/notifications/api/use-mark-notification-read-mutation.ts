'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markNotificationRead } from './notifications.api'
import { notificationsQueryKeys } from './notifications.query-keys'

/**
 * Marks a single notification as read and invalidates notification queries.
 */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.listAll() })
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all })
    },
  })
}
