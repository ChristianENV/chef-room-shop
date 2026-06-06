'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountQueryKeys } from '@/src/features/storefront/account/api/account.query-keys'

import { claimGuestOrderByCheckoutToken } from '../api/checkout.api'
import { checkoutQueryKeys } from '../api/checkout.query-keys'

/**
 * Links a guest checkout order to the authenticated session user.
 */
export function useClaimGuestOrderByCheckoutTokenMutation(
  orderNumber: string,
  token: string,
) {
  const queryClient = useQueryClient()
  const normalizedOrderNumber = orderNumber.trim()
  const normalizedToken = token.trim()

  return useMutation({
    mutationKey: [
      ...checkoutQueryKeys.orderByCheckoutToken(normalizedOrderNumber, normalizedToken),
      'claim',
    ],
    mutationFn: () =>
      claimGuestOrderByCheckoutToken(normalizedOrderNumber, normalizedToken),
    onSuccess: (result) => {
      if (!result.success) {
        return
      }

      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.ordersAll() })
      void queryClient.invalidateQueries({
        queryKey: accountQueryKeys.order(normalizedOrderNumber),
      })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
      void queryClient.invalidateQueries({
        queryKey: checkoutQueryKeys.orderByCheckoutToken(
          normalizedOrderNumber,
          normalizedToken,
        ),
      })
    },
  })
}
