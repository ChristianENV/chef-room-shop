'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyCart } from './cart.api'
import { cartQueryKeys } from './cart.query-keys'

/**
 * TanStack Query hook for the active cart (guest or authenticated).
 */
export function useMyCartQuery() {
  return useQuery({
    queryKey: cartQueryKeys.myCart(),
    queryFn: () => getMyCart(),
  })
}
