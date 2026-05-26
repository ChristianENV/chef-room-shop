'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cartQueryKeys } from '@/src/features/storefront/cart/api/cart.query-keys'

import type { CreateCheckoutOrderInput } from '../types'
import { completeCheckout } from './checkout.api'

/**
 * Creates order + Conekta checkout and returns payment redirect URL.
 */
export function useCompleteCheckoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCheckoutOrderInput) => completeCheckout(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.myCart() })
    },
  })
}
