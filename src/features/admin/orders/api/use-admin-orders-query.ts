'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminOrders } from './admin-orders.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'
import type { AdminOrdersListVariables } from '../types'

/**
 * TanStack Query hook for paginated admin orders list.
 */
export function useAdminOrdersQuery(variables?: AdminOrdersListVariables) {
  return useQuery({
    queryKey: adminOrdersQueryKeys.list(variables),
    queryFn: () => getAdminOrders(variables),
  })
}
