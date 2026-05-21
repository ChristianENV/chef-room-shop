'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createShippingQuote } from './shipping.api'
import { shippingQueryKeys } from './shipping.query-keys'
import type { CreateShippingQuoteInput } from '../types'

/**
 * Creates a shipping quote for the active cart (guest or authenticated).
 */
export function useCreateShippingQuoteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateShippingQuoteInput) => createShippingQuote(input),
    onSuccess: (payload) => {
      queryClient.setQueryData(
        shippingQueryKeys.quoteById(payload.quote.id),
        payload.quote,
      )
    },
  })
}
