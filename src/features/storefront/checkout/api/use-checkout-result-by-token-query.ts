'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getPaymentStatusUi } from '../lib/payment-status-ui'
import { useCheckoutResultPolling } from '../lib/use-checkout-result-polling'
import type { CheckoutResult } from '../types'
import { getCheckoutResultByToken } from './checkout.api'
import { checkoutQueryKeys } from './checkout.query-keys'

type UseCheckoutResultByTokenQueryOptions = {
  token: string
  enabled?: boolean
  pollWhilePending?: boolean
}

/**
 * Fetches checkout confirmation by opaque return token (no email required).
 */
export function useCheckoutResultByTokenQuery(options: UseCheckoutResultByTokenQueryOptions) {
  const { token, enabled = true, pollWhilePending = false } = options

  const query = useQuery<CheckoutResult | null>({
    queryKey: checkoutQueryKeys.checkoutResultByToken(token),
    queryFn: () => getCheckoutResultByToken(token),
    enabled: enabled && token.length > 0,
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
    resetKey: `${token}:${pollWhilePending}`,
  })

  return query
}
