'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { retryMyOrderPayment } from './account.api'
import { accountQueryKeys } from './account.query-keys'

/**
 * Retries Conekta payment for one owned order (scoped per orderNumber).
 */
export function useRetryMyOrderPaymentMutation(orderNumber: string) {
  const queryClient = useQueryClient()
  const normalized = orderNumber.trim()

  return useMutation({
    mutationKey: accountQueryKeys.retryPayment(normalized),
    mutationFn: () => retryMyOrderPayment(normalized),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.ordersAll() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.order(normalized) })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
