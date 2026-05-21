'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { selectShippingRate } from './shipping.api'
import { shippingQueryKeys } from './shipping.query-keys'

/**
 * Selects a shipping rate on the current quote.
 */
export function useSelectShippingRateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rateId: string) => selectShippingRate(rateId),
    onSuccess: (payload) => {
      queryClient.setQueryData(
        shippingQueryKeys.quoteById(payload.quote.id),
        payload.quote,
      )
      void queryClient.invalidateQueries({ queryKey: shippingQueryKeys.all })
    },
  })
}
