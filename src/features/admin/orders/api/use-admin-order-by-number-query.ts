'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminOrderByNumber } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

/**
 * TanStack Query hook for a single admin order detail.
 */
export function useAdminOrderByNumberQuery(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: adminOrdersQueryKeys.detail(orderNumber),
    queryFn: () => getAdminOrderByNumber(orderNumber),
    enabled: enabled && orderNumber.length > 0,
  })
}
