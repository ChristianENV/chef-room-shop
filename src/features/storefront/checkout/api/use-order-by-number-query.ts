'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getPaymentStatusUi } from '../lib/payment-status-ui'
import { useCheckoutResultPolling } from '../lib/use-checkout-result-polling'
import type { PublicOrder } from '../types'
import { getOrderByNumber } from './checkout.api'
import { checkoutQueryKeys } from './checkout.query-keys'

type UseOrderByNumberQueryOptions = {
  orderNumber: string
  email: string
  enabled?: boolean
  /** Refetch while payment is pending (fast then slow tier). */
  pollWhilePending?: boolean
}

/**
 * Fetches a public order confirmation by order number and customer email.
 */
export function useOrderByNumberQuery(options: UseOrderByNumberQueryOptions) {
  const { orderNumber, email, enabled = true, pollWhilePending = false } = options

  const query = useQuery<PublicOrder | null>({
    queryKey: checkoutQueryKeys.orderByNumber(orderNumber, email),
    queryFn: () => getOrderByNumber(orderNumber, email),
    enabled: enabled && orderNumber.length > 0 && email.length > 0,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: false,
  })

  const shouldPoll = useMemo(() => {
    if (!pollWhilePending || !query.data) {
      return false
    }
    const ui = getPaymentStatusUi({
      orderStatus: query.data.status,
      paymentStatus: query.data.paymentStatus,
    })
    return ui.shouldPoll
  }, [pollWhilePending, query.data])

  useCheckoutResultPolling({
    shouldPoll,
    refetch: query.refetch,
    resetKey: `${orderNumber}:${email}:${pollWhilePending}`,
  })

  return query
}
