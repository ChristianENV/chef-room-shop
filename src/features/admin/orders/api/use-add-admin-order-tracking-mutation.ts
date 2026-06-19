'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addAdminOrderTracking } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'
import type { AddAdminOrderTrackingInput } from '../types'

/**
 * Adds shipment tracking to an order and invalidates related admin order queries.
 */
export function useAddAdminOrderTrackingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddAdminOrderTrackingInput) => addAdminOrderTracking(input),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.setQueryData(adminOrdersQueryKeys.detail(order.orderNumber), order)
    },
  })
}
