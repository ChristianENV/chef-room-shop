'use client'

import { useQuery } from '@tanstack/react-query'

import { getShippingQuoteById } from './shipping.api'
import { shippingQueryKeys } from './shipping.query-keys'

type UseShippingQuoteByIdQueryOptions = {
  enabled?: boolean
}

/**
 * Loads a persisted shipping quote (no Skydropx refresh).
 */
export function useShippingQuoteByIdQuery(
  id: string | null | undefined,
  options?: UseShippingQuoteByIdQueryOptions,
) {
  return useQuery({
    queryKey: shippingQueryKeys.quoteById(id ?? ''),
    queryFn: () => {
      if (!id) return Promise.resolve(null)
      return getShippingQuoteById(id)
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  })
}
