'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cartQueryKeys } from '@/src/features/storefront/cart/api/cart.query-keys'

import type { CreateCheckoutOrderInput } from '../types'
import { createCheckoutOrder } from './checkout.api'

/**
 * Converts the active cart into a checkout order (invalidates cart cache on success).
 */
export function useCreateCheckoutOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCheckoutOrderInput) => createCheckoutOrder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.myCart() })
    },
  })
}
