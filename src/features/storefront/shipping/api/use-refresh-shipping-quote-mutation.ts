'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { refreshShippingQuote } from './shipping.api'
import { shippingQueryKeys } from './shipping.query-keys'

/**
 * Polls Skydropx when quote.isCompleted is false.
 */
export function useRefreshShippingQuoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => refreshShippingQuote(id),
    onSuccess: (payload) => {
      queryClient.setQueryData(
        shippingQueryKeys.quoteById(payload.quote.id),
        payload.quote,
      )
    },
  })
}
