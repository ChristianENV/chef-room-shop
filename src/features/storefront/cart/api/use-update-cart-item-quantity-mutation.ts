'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateCartItemQuantityInput } from '../types/cart-bff.types'
import { updateCartItemQuantity } from './cart.api'
import { cartQueryKeys } from './cart.query-keys'

/**
 * Updates cart line quantity and refreshes `myCart`.
 */
export function useUpdateCartItemQuantityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCartItemQuantityInput) => updateCartItemQuantity(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.myCart() })
    },
  })
}
