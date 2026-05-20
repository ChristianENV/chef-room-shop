'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { clearCart } from './cart.api'
import { cartQueryKeys } from './cart.query-keys'

/**
 * Clears all items from the active cart and refreshes `myCart`.
 */
export function useClearCartMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.myCart() })
    },
  })
}
