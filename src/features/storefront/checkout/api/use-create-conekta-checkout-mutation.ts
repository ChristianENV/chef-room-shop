'use client'

import { useMutation } from '@tanstack/react-query'

import type { CreateConektaCheckoutInput } from '../types'
import { createConektaCheckout } from './checkout.api'
import { checkoutQueryKeys } from './checkout.query-keys'

/**
 * Starts Conekta hosted checkout for a placed order.
 */
export function useCreateConektaCheckoutMutation() {
  return useMutation({
    mutationFn: (input: CreateConektaCheckoutInput) => createConektaCheckout(input),
    meta: {
      invalidates: (variables: CreateConektaCheckoutInput) => [
        checkoutQueryKeys.conektaCheckout(variables.orderNumber),
      ],
    },
  })
}
