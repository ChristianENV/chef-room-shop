'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRetryMyOrderPaymentMutation } from '../api/use-retry-my-order-payment-mutation'
import type { AccountOrderPaymentActions, AccountPaymentStatusPayload } from '../types'
import { VerifyPaymentAction } from './verify-payment-action'

type OrderPaymentActionsProps = {
  orderNumber: string
  paymentActions: AccountOrderPaymentActions
  paymentStatus: string
  orderStatus: string
  variant?: 'list' | 'detail'
  className?: string
  onVerified?: (payload: AccountPaymentStatusPayload) => void
}

function isPaidStatus(paymentStatus: string, orderStatus: string): boolean {
  return paymentStatus === 'PAID' || orderStatus === 'PAID'
}

function deriveActionsFromPayload(
  payload: AccountPaymentStatusPayload,
): AccountOrderPaymentActions {
  const isPaid = isPaidStatus(payload.paymentStatus, payload.orderStatus)

  return {
    canVerifyPayment:
      !isPaid &&
      (payload.paymentStatus === 'PENDING' ||
        payload.paymentStatus === 'AUTHORIZED' ||
        payload.orderStatus === 'PENDING_PAYMENT' ||
        payload.paymentStatus === 'FAILED' ||
        payload.paymentStatus === 'CANCELLED'),
    canContinuePayment: payload.canContinuePayment,
    canRetryPayment: payload.canRetryPayment,
    paymentRedirectUrl: payload.paymentRedirectUrl,
  }
}

/**
 * Manual Conekta payment actions: verify (shared), continue, retry.
 */
export function OrderPaymentActions({
  orderNumber,
  paymentActions,
  paymentStatus,
  orderStatus,
  variant = 'detail',
  className,
  onVerified,
}: OrderPaymentActionsProps) {
  const retryMutation = useRetryMyOrderPaymentMutation(orderNumber)
  const [retryFeedback, setRetryFeedback] = useState<AccountPaymentStatusPayload | null>(null)
  const [syncedActions, setSyncedActions] = useState<AccountOrderPaymentActions | null>(null)

  const currentPaymentStatus = retryFeedback?.paymentStatus ?? paymentStatus
  const currentOrderStatus = retryFeedback?.orderStatus ?? orderStatus
  const isPaid = isPaidStatus(currentPaymentStatus, currentOrderStatus)

  const resolvedActions = retryFeedback
    ? deriveActionsFromPayload(retryFeedback)
    : (syncedActions ?? paymentActions)

  const showPendingBadge =
    !isPaid &&
    (currentPaymentStatus === 'PENDING' ||
      currentPaymentStatus === 'AUTHORIZED' ||
      currentOrderStatus === 'PENDING_PAYMENT')

  const handleVerified = (payload: AccountPaymentStatusPayload) => {
    setSyncedActions(deriveActionsFromPayload(payload))
    onVerified?.(payload)
  }

  const handleRetry = () => {
    setRetryFeedback(null)
    retryMutation.mutate(undefined, {
      onSuccess: (result) => {
        setRetryFeedback(result)
        setSyncedActions(deriveActionsFromPayload(result))
        if (result.paymentRedirectUrl) {
          window.location.assign(result.paymentRedirectUrl)
        }
      },
      onError: () => {
        setRetryFeedback({
          orderNumber,
          orderStatus,
          paymentStatus,
          paymentMethod: null,
          canRetryPayment: true,
          canContinuePayment: false,
          paymentRedirectUrl: null,
          checkedAt: new Date().toISOString(),
          message: 'No pudimos preparar el pago. Intenta de nuevo.',
        })
      },
    })
  }

  const handleContinue = () => {
    const url = resolvedActions.paymentRedirectUrl
    if (url) {
      window.location.assign(url)
    }
  }

  const hasRetryMessage = retryFeedback?.message
  const showRetry = resolvedActions.canRetryPayment && !isPaid
  const showContinue =
    resolvedActions.canContinuePayment && Boolean(resolvedActions.paymentRedirectUrl)
  const showVerify = !isPaid && resolvedActions.canVerifyPayment

  if (!showVerify && !showContinue && !showRetry && !hasRetryMessage) {
    return null
  }

  return (
    <div
      className={cn(
        'space-y-3',
        variant === 'list' && 'mt-3 border-t border-border pt-3',
        className,
      )}
    >
      {variant === 'detail' && showPendingBadge && (
        <p className="font-serif text-sm text-muted-foreground">
          Estamos esperando confirmación de Conekta. Si acabas de pagar, puede tardar unos minutos.
        </p>
      )}

      {variant === 'list' && showPendingBadge && (
        <span className="inline-flex items-center rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 font-sans text-xs font-medium text-warning">
          Pago pendiente
        </span>
      )}

      <div className="flex flex-wrap items-start gap-2">
        {showVerify && (
          <VerifyPaymentAction
            orderNumber={orderNumber}
            paymentStatus={currentPaymentStatus}
            orderStatus={currentOrderStatus}
            paymentActions={resolvedActions}
            variant={variant === 'list' ? 'card' : 'detail'}
            onVerified={handleVerified}
          />
        )}

        {showContinue && (
          <Button type="button" variant="default" size="sm" onClick={handleContinue}>
            Continuar pago
          </Button>
        )}

        {showRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={retryMutation.isPending}
            onClick={(event) => {
              event.stopPropagation()
              handleRetry()
            }}
          >
            {retryMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {variant === 'detail' &&
            (currentPaymentStatus === 'CANCELLED' || currentPaymentStatus === 'FAILED')
              ? 'Generar nuevo enlace de pago'
              : 'Reintentar pago'}
          </Button>
        )}
      </div>

      {hasRetryMessage && (
        <p className="font-serif text-sm text-muted-foreground" role="status">
          {retryFeedback.message}
        </p>
      )}

      {variant === 'detail' && !isPaid && (
        <p className="font-serif text-xs text-muted-foreground">
          &quot;Verificar pago&quot; consulta el estado más reciente de Conekta. La confirmación
          final depende de Conekta.
        </p>
      )}
    </div>
  )
}
