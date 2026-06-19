'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addAdminOrderNote } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'
import type { AddAdminOrderNoteInput } from '../types'

/**
 * Adds an internal note to an order and invalidates related admin order queries.
 */
export function useAddAdminOrderNoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddAdminOrderNoteInput) => addAdminOrderNote(input),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.setQueryData(adminOrdersQueryKeys.detail(order.orderNumber), order)
    },
  })
}
