'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminDashboardQueryKeys } from '@/src/features/admin/dashboard/api/admin-dashboard.query-keys'
import { adminOrdersQueryKeys } from '@/src/features/admin/orders/api/admin-orders.query-keys'

import { cancelAdminShippingLabel } from './admin-shipping.api'
import { adminShippingQueryKeys } from './admin-shipping.query-keys'
import type { AdminCancelShippingLabelInput } from '../types'

/**
 * Cancels a Skydropx label and invalidates admin order/shipping queries.
 */
export function useAdminCancelShippingLabelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminCancelShippingLabelInput) =>
      cancelAdminShippingLabel(input),
    onSuccess: (shipment) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminShippingQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminDashboardQueryKeys.all })
      void queryClient.setQueryData(
        adminShippingQueryKeys.detail(shipment.orderNumber),
        shipment,
      )
    },
  })
}
