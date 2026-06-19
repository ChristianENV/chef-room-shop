'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountQueryKeys } from '@/src/features/storefront/account/api/account.query-keys'

import { verifyCheckoutPaymentByToken } from '../api/checkout.api'
import { checkoutQueryKeys } from '../api/checkout.query-keys'

/**
 * Token-scoped Conekta payment verification (same sync as verifyMyOrderPayment).
 */
export function useVerifyCheckoutPaymentByTokenMutation(orderNumber: string, token: string) {
  const queryClient = useQueryClient()
  const normalizedOrderNumber = orderNumber.trim()
  const normalizedToken = token.trim()

  return useMutation({
    mutationKey: [
      ...checkoutQueryKeys.orderByCheckoutToken(normalizedOrderNumber, normalizedToken),
      'verifyPayment',
    ],
    mutationFn: () => verifyCheckoutPaymentByToken(normalizedOrderNumber, normalizedToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: checkoutQueryKeys.orderByCheckoutToken(normalizedOrderNumber, normalizedToken),
      })
      void queryClient.invalidateQueries({
        queryKey: accountQueryKeys.order(normalizedOrderNumber),
      })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.ordersAll() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
