'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminTopProducts } from './admin-dashboard.api'
import { adminDashboardQueryKeys } from './admin-dashboard.query-keys'

/**
 * TanStack Query hook for admin top products by revenue.
 */
export function useAdminTopProductsQuery(limit?: number) {
  return useQuery({
    queryKey: adminDashboardQueryKeys.topProducts(limit),
    queryFn: () => getAdminTopProducts(limit),
  })
}
