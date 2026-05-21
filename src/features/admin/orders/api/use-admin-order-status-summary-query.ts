'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminOrderStatusSummary } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

/**
 * TanStack Query hook for admin order status summary counts.
 */
export function useAdminOrderStatusSummaryQuery() {
  return useQuery({
    queryKey: adminOrdersQueryKeys.statusSummary(),
    queryFn: getAdminOrderStatusSummary,
  })
}
