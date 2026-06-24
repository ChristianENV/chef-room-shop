'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminOrderProductionSheet } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

/**
 * TanStack Query hook for admin production sheet by order number.
 */
export function useAdminOrderProductionSheetQuery(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: adminOrdersQueryKeys.productionSheet(orderNumber),
    queryFn: () => getAdminOrderProductionSheet(orderNumber),
    enabled: enabled && orderNumber.length > 0,
  })
}
