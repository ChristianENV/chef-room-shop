'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useVerifyMyOrderPaymentMutation } from '../api/use-verify-my-order-payment-mutation'
import type { AccountOrderPaymentActions, AccountPaymentStatusPayload } from '../types'

type VerifyPaymentActionProps = {
  orderNumber: string
  paymentStatus: string
  orderStatus: string
  paymentActions: AccountOrderPaymentActions
  variant?: 'card' | 'detail'
  className?: string
  onVerified?: (payload: AccountPaymentStatusPayload) => void
}

function isPaidStatus(paymentStatus: string, orderStatus: string): boolean {
  return paymentStatus === 'PAID' || orderStatus === 'PAID'
}

/**
 * Calls verifyMyOrderPayment for a single order (Conekta sync fallback).
 */
export function VerifyPaymentAction({
  orderNumber,
  paymentStatus,
  orderStatus,
  paymentActions,
  variant = 'card',
  className,
  onVerified,
}: VerifyPaymentActionProps) {
  const verifyMutation = useVerifyMyOrderPaymentMutation(orderNumber)
  const [feedback, setFeedback] = useState<AccountPaymentStatusPayload | null>(null)

  const currentPaymentStatus = feedback?.paymentStatus ?? paymentStatus
  const currentOrderStatus = feedback?.orderStatus ?? orderStatus
  const isPaid = isPaidStatus(currentPaymentStatus, currentOrderStatus)

  const canVerify = !isPaid && paymentActions.canVerifyPayment

  if (!canVerify) {
    return feedback?.message ? (
      <p
        className={cn(
          'font-serif text-sm',
          isPaid ? 'text-success' : 'text-muted-foreground',
          className,
        )}
        role="status"
      >
        {feedback.message}
      </p>
    ) : null
  }

  const message = feedback?.message

  const handleClick = () => {
    if (!orderNumber.trim()) {
      return
    }

    setFeedback(null)
    verifyMutation.mutate(undefined, {
      onSuccess: (result) => {
        setFeedback(result)
        onVerified?.(result)
      },
      onError: () => {
        setFeedback({
          orderNumber,
          orderStatus,
          paymentStatus,
          paymentMethod: null,
          canRetryPayment: paymentActions.canRetryPayment,
          canContinuePayment: paymentActions.canContinuePayment,
          paymentRedirectUrl: paymentActions.paymentRedirectUrl,
          checkedAt: new Date().toISOString(),
          message: 'No pudimos verificar el pago. Intenta de nuevo.',
        })
      },
    })
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        type="button"
        variant={variant === 'card' ? 'outline' : 'secondary'}
        size="sm"
        disabled={verifyMutation.isPending}
        onClick={(event) => {
          event.stopPropagation()
          handleClick()
        }}
      >
        {verifyMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        {verifyMutation.isPending ? 'Verificando…' : 'Verificar pago'}
      </Button>

      {message && (
        <p
          className={cn('font-serif text-sm', isPaid ? 'text-success' : 'text-muted-foreground')}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  )
}
