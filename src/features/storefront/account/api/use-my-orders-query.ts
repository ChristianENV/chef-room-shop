'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyOrders } from './account.api'
import { accountQueryKeys } from './account.query-keys'

/**
 * TanStack Query hook for the authenticated user's orders.
 */
export function useMyOrdersQuery(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: accountQueryKeys.orders(params ?? {}),
    queryFn: () => getMyOrders(params),
  })
}
