'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { moveAdminOrderToProduction } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

/**
 * Moves an order into production and invalidates related admin order queries.
 */
export function useMoveAdminOrderToProductionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderNumber: string) => moveAdminOrderToProduction(orderNumber),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.setQueryData(adminOrdersQueryKeys.detail(order.orderNumber), order)
    },
  })
}
