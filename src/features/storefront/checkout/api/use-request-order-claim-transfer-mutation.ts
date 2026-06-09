'use client'

import { useMutation } from '@tanstack/react-query'

import { requestOrderClaimTransfer } from '../api/checkout.api'
import { checkoutQueryKeys } from '../api/checkout.query-keys'

/**
 * Sends an authorization email to the original purchase email for cross-account order linking.
 */
export function useRequestOrderClaimTransferMutation(
  orderNumber: string,
  checkoutToken: string,
) {
  const normalizedOrderNumber = orderNumber.trim()
  const normalizedToken = checkoutToken.trim()

  return useMutation({
    mutationKey: [
      ...checkoutQueryKeys.orderByCheckoutToken(normalizedOrderNumber, normalizedToken),
      'request-transfer',
    ],
    mutationFn: () =>
      requestOrderClaimTransfer(normalizedOrderNumber, normalizedToken),
  })
}
