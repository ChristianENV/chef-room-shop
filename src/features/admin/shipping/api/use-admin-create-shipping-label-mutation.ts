'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminOrdersQueryKeys } from '@/src/features/admin/orders/api/admin-orders.query-keys'

import { createAdminShippingLabel } from './admin-shipping.api'
import { adminShippingQueryKeys } from './admin-shipping.query-keys'
import type { AdminCreateShippingLabelInput } from '../types'

/**
 * Creates a Skydropx label and invalidates admin order/shipping queries.
 */
export function useAdminCreateShippingLabelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminCreateShippingLabelInput) =>
      createAdminShippingLabel(input),
    onSuccess: (shipment) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminShippingQueryKeys.all })
      void queryClient.setQueryData(
        adminShippingQueryKeys.detail(shipment.orderNumber),
        shipment,
      )
    },
  })
}
