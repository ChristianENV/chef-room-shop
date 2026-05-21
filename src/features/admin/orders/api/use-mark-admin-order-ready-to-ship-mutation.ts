'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markAdminOrderReadyToShip } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

/**
 * Marks an order as ready to ship and invalidates related admin order queries.
 */
export function useMarkAdminOrderReadyToShipMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderNumber: string) => markAdminOrderReadyToShip(orderNumber),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.setQueryData(
        adminOrdersQueryKeys.detail(order.orderNumber),
        order,
      )
    },
  })
}
