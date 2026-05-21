'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminShipmentByOrderNumber } from './admin-shipping.api'
import { adminShippingQueryKeys } from './admin-shipping.query-keys'

/**
 * TanStack Query hook for admin shipment/label by order number.
 */
export function useAdminShipmentByOrderNumberQuery(
  orderNumber: string,
  enabled = true,
) {
  return useQuery({
    queryKey: adminShippingQueryKeys.detail(orderNumber),
    queryFn: () => getAdminShipmentByOrderNumber(orderNumber),
    enabled: enabled && orderNumber.length > 0,
  })
}
