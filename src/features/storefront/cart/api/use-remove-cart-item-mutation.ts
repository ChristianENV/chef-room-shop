'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { removeCartItem } from './cart.api'
import { cartQueryKeys } from './cart.query-keys'

/**
 * Removes a cart line and refreshes `myCart`.
 */
export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.myCart() })
    },
  })
}
