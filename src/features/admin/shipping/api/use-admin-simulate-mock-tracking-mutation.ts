'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminDashboardQueryKeys } from '@/src/features/admin/dashboard/api/admin-dashboard.query-keys'
import { adminOrdersQueryKeys } from '@/src/features/admin/orders/api/admin-orders.query-keys'

import { simulateAdminMockShipmentTracking } from './admin-shipping.api'
import { adminShippingQueryKeys } from './admin-shipping.query-keys'
import type { AdminSimulateMockShipmentTrackingInput } from '../types'

/**
 * Simulates mock shipment tracking status and invalidates related queries.
 */
export function useAdminSimulateMockShipmentTrackingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AdminSimulateMockShipmentTrackingInput) =>
      simulateAdminMockShipmentTracking(input),
    onSuccess: (shipment) => {
      void queryClient.invalidateQueries({ queryKey: adminOrdersQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminShippingQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: adminDashboardQueryKeys.all })
      void queryClient.setQueryData(adminShippingQueryKeys.detail(shipment.orderNumber), shipment)
    },
  })
}
