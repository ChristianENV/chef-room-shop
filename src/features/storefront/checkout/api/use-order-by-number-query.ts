'use client'

import { useEffect, useMemo, useRef } from 'react'
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
    if (!pollWhilePending || !query.data) return false
    const ui = getPaymentStatusUi({
      orderStatus: query.data.status,
      paymentStatus: query.data.paymentStatus,
    })
    return ui.shouldPoll
  }, [pollWhilePending, query.data])

  useEffect(() => {
    pollAttemptsRef.current = 0
  }, [orderNumber, email, pollWhilePending])

  useEffect(() => {
    if (!shouldPoll) return

    const intervalId = window.setInterval(() => {
      pollAttemptsRef.current += 1
      if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
        window.clearInterval(intervalId)
        return
      }
      void query.refetch()
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [shouldPoll, query.refetch])

  return query
}
