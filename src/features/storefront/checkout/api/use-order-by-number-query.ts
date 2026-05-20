'use client'

import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getPaymentStatusUi } from '../lib/payment-status-ui'
import type { PublicOrder } from '../types'
import { getOrderByNumber } from './checkout.api'
import { checkoutQueryKeys } from './checkout.query-keys'

const POLL_INTERVAL_MS = 5_000
const MAX_POLL_ATTEMPTS = 24

type UseOrderByNumberQueryOptions = {
  orderNumber: string
  email: string
  enabled?: boolean
  /** Refetch every 5s while payment is pending (stops after ~2 min or terminal status). */
  pollWhilePending?: boolean
}

/**
 * Fetches a public order confirmation by order number and customer email.
 */
export function useOrderByNumberQuery(options: UseOrderByNumberQueryOptions) {
  const { orderNumber, email, enabled = true, pollWhilePending = false } = options
  const pollAttemptsRef = useRef(0)

  useEffect(() => {
    pollAttemptsRef.current = 0
  }, [orderNumber, email, pollWhilePending])

  return useQuery<PublicOrder | null>({
    queryKey: checkoutQueryKeys.orderByNumber(orderNumber, email),
    queryFn: () => getOrderByNumber(orderNumber, email),
    enabled: enabled && orderNumber.length > 0 && email.length > 0,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchInterval: pollWhilePending
      ? (query) => {
          const order = query.state.data
          if (order) {
            const ui = getPaymentStatusUi({
              orderStatus: order.status,
              paymentStatus: order.paymentStatus,
            })
            if (!ui.shouldPoll) {
              pollAttemptsRef.current = 0
              return false
            }
          }

          pollAttemptsRef.current += 1
          if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
            return false
          }

          return POLL_INTERVAL_MS
        }
      : false,
  })
}
