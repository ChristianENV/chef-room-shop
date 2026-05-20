'use client'

import { useQuery } from '@tanstack/react-query'

import type { AccountOrder } from '../types'
import { getMyOrderByNumber } from './account.api'
import { accountQueryKeys } from './account.query-keys'

type UseMyOrderByNumberQueryOptions = {
  orderNumber: string
  enabled?: boolean
}

/**
 * Fetches a single authenticated order by order number.
 */
export function useMyOrderByNumberQuery(options: UseMyOrderByNumberQueryOptions) {
  const { orderNumber, enabled = true } = options

  return useQuery<AccountOrder | null>({
    queryKey: accountQueryKeys.order(orderNumber),
    queryFn: () => getMyOrderByNumber(orderNumber),
    enabled: enabled && orderNumber.length > 0,
  })
}
