'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { AddCartItemInput } from '../types/cart-bff.types'
import { addCartItem } from './cart.api'
import { cartQueryKeys } from './cart.query-keys'

/**
 * Adds a product to the active cart and refreshes `myCart`.
 */
export function useAddCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddCartItemInput) => addCartItem(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.myCart() })
    },
  })
}
