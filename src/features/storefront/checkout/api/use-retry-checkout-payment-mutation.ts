'use client'

import { useMutation } from '@tanstack/react-query'

import { retryCheckoutPayment } from './checkout.api'

/**
 * Retries Conekta checkout for an existing order using return token.
 */
export function useRetryCheckoutPaymentMutation() {
  return useMutation({
    mutationFn: (returnToken: string) => retryCheckoutPayment(returnToken),
  })
}
