'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminRecentOrders } from './admin-dashboard.api'
import { adminDashboardQueryKeys } from './admin-dashboard.query-keys'

/**
 * TanStack Query hook for admin recent orders list.
 */
export function useAdminRecentOrdersQuery(limit?: number) {
  return useQuery({
    queryKey: adminDashboardQueryKeys.recentOrders(limit),
    queryFn: () => getAdminRecentOrders(limit),
  })
}
