'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminOrderProductionQueue } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

/**
 * TanStack Query hook for the admin production queue (full orders).
 */
export function useAdminOrderProductionQueueQuery(limit?: number) {
  return useQuery({
    queryKey: adminOrdersQueryKeys.productionQueue(limit),
    queryFn: () => getAdminOrderProductionQueue(limit),
  })
}
