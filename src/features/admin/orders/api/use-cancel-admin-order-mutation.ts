'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cancelAdminOrder } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

type CancelAdminOrderVariables = {
  orderNumber: string
  reason?: string | null
}

/**
 * Cancels an order (no automatic refund) and invalidates related admin order queries.
 */
export function useCancelAdminOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderNumber, reason }: CancelAdminOrderVariables) =>
      cancelAdminOrder(orderNumber, reason),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.setQueryData(adminOrdersQueryKeys.detail(order.orderNumber), order)
    },
  })
}
