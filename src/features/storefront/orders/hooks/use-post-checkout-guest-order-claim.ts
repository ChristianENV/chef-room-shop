'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { accountOrderDetail } from '@/src/config/routes'
import { useClaimGuestOrderByCheckoutTokenMutation } from '@/src/features/storefront/checkout/api/use-claim-guest-order-by-checkout-token-mutation'
import type { ClaimGuestOrderPayload, ClaimGuestOrderStatus } from '@/src/features/storefront/checkout/types'

type UsePostCheckoutGuestOrderClaimOptions = {
  orderNumber: string
  checkoutToken: string
  enabled: boolean
  emailVerified: boolean
  onClaimSettled?: () => void
}

/**
 * Automatically links a guest checkout order when the user returns authenticated with a valid token.
 */
export function usePostCheckoutGuestOrderClaim({
  orderNumber,
  checkoutToken,
  enabled,
  emailVerified,
  onClaimSettled,
}: UsePostCheckoutGuestOrderClaimOptions) {
  const router = useRouter()
  const claimAttemptedRef = useRef(false)
  const claimMutation = useClaimGuestOrderByCheckoutTokenMutation(orderNumber, checkoutToken)
  const mutateClaimRef = useRef(claimMutation.mutate)

  useEffect(() => {
    mutateClaimRef.current = claimMutation.mutate
  }, [claimMutation.mutate])

  useEffect(() => {
    if (!enabled || claimAttemptedRef.current) {
      return
    }

    claimAttemptedRef.current = true
    mutateClaimRef.current(undefined, {
      onSettled: (result) => {
        onClaimSettled?.()

        if (!result?.success) {
          return
        }

        if (
          (result.status === 'CLAIMED' || result.status === 'ALREADY_CLAIMED_BY_USER') &&
          emailVerified
        ) {
          router.replace(accountOrderDetail(orderNumber, { from: 'checkout' }))
          router.refresh()
        }
      },
    })
  }, [enabled, emailVerified, orderNumber, onClaimSettled, router])

  const orderLinkedToAccount = Boolean(
    claimMutation.data?.success &&
      (claimMutation.data.status === 'CLAIMED' ||
        claimMutation.data.status === 'ALREADY_CLAIMED_BY_USER'),
  )

  return {
    orderLinkedToAccount,
    claimStatus: (claimMutation.data?.status ?? null) as ClaimGuestOrderStatus | null,
    claimMessage: claimMutation.data?.message ?? null,
    isClaimingOrder: claimMutation.isPending,
  }
}

export type { ClaimGuestOrderPayload }
