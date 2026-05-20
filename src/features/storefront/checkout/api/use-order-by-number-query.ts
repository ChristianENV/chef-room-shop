'use client'

import { useQuery } from '@tanstack/react-query'

import type { PublicOrder } from '../types'
import { getOrderByNumber } from './checkout.api'
import { checkoutQueryKeys } from './checkout.query-keys'

type UseOrderByNumberQueryOptions = {
  orderNumber: string
  email: string
  enabled?: boolean
}

/**
 * Fetches a public order confirmation by order number and customer email.
 */
export function useOrderByNumberQuery(options: UseOrderByNumberQueryOptions) {
  const { orderNumber, email, enabled = true } = options

  return useQuery<PublicOrder | null>({
    queryKey: checkoutQueryKeys.orderByNumber(orderNumber, email),
    queryFn: () => getOrderByNumber(orderNumber, email),
    enabled: enabled && orderNumber.length > 0 && email.length > 0,
  })
}
