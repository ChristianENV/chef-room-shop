'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyCart } from './cart.api'
import { cartQueryKeys } from './cart.query-keys'

type UseMyCartQueryOptions = {
  enabled?: boolean
  /** Avoid refetching the cart on every navbar render (default 60s). */
  staleTime?: number
}

const DEFAULT_STALE_TIME_MS = 60_000

/**
 * TanStack Query hook for the active cart (guest or authenticated).
 */
export function useMyCartQuery(options?: UseMyCartQueryOptions) {
  return useQuery({
    queryKey: cartQueryKeys.myCart(),
    queryFn: () => getMyCart(),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? DEFAULT_STALE_TIME_MS,
  })
}

/**
 * Active cart line-item count for navbar badges (`totalItems` from BFF).
 */
export function useCartBadgeCount(): number {
  const { data } = useMyCartQuery()
  return data?.totalItems ?? 0
}
