'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminProductionQueue } from './admin-dashboard.api'
import { adminDashboardQueryKeys } from './admin-dashboard.query-keys'

/**
 * TanStack Query hook for admin production queue.
 */
export function useAdminProductionQueueQuery(limit?: number) {
  return useQuery({
    queryKey: adminDashboardQueryKeys.productionQueue(limit),
    queryFn: () => getAdminProductionQueue(limit),
  })
}
