'use client'

import { useQuery } from '@tanstack/react-query'

import type { CheckoutOrderDetailAccess } from '../api/checkout.api'
import { getOrderByCheckoutToken } from '../api/checkout.api'
import { checkoutQueryKeys } from '../api/checkout.query-keys'

type UseOrderByCheckoutTokenQueryOptions = {
  orderNumber: string
  token: string
  enabled?: boolean
}

/**
 * Token-scoped order detail for post-checkout guest or return flow.
 */
export function useOrderByCheckoutTokenQuery(options: UseOrderByCheckoutTokenQueryOptions) {
  const { orderNumber, token, enabled = true } = options

  return useQuery<CheckoutOrderDetailAccess | null>({
    queryKey: checkoutQueryKeys.orderByCheckoutToken(orderNumber, token),
    queryFn: () => getOrderByCheckoutToken(orderNumber, token),
    enabled: enabled && orderNumber.length > 0 && token.length > 0,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    retry: false,
  })
}
