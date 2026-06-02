'use client'

import Link from 'next/link'
import { Loader2, RefreshCw, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { routes } from '@/src/config/routes'

import { CheckoutConektaPay } from './checkout-conekta-pay'
import type { PaymentConfirmationUxState } from './lib/payment-confirmation-state'
import { getPaymentConfirmationActions } from './lib/payment-confirmation-state'
import { PAID_ORDER_REDIRECT_SECONDS } from './lib/use-paid-order-redirect-countdown'

type CheckoutSuccessActionsProps = {
  confirmationState: PaymentConfirmationUxState
  isAuthenticated: boolean
  orderNumber: string
  claimUrl?: string | null
  accountOrderUrl?: string | null
  detailUrl?: string | null
  loginUrl?: string
  registerUrl?: string
  canViewDetails?: boolean
  onGuestDetailsClick?: () => void
  onVerifyAgain?: () => void
  isVerifying?: boolean
  verifyMessage?: string | null
  showWaitingNote?: boolean
  paidRedirectSecondsLeft?: number | null
  paidRedirectUrl?: string | null
  onCancelPaidRedirect?: () => void
  returnToken?: string | null
  legacyEmail?: string
  showManualRetryPayment?: boolean
}

export function CheckoutSuccessActions({
  confirmationState,
  isAuthenticated,
  orderNumber,
  claimUrl,
  accountOrderUrl,
  detailUrl,
  loginUrl = routes.login,
  registerUrl = routes.register,
  canViewDetails,
  onGuestDetailsClick,
  onVerifyAgain,
  isVerifying = false,
  verifyMessage,
  showWaitingNote = false,
  paidRedirectSecondsLeft = null,
  paidRedirectUrl = null,
  onCancelPaidRedirect,
  returnToken,
  legacyEmail,
  showManualRetryPayment = false,
}: CheckoutSuccessActionsProps) {
  const actions = getPaymentConfirmationActions(confirmationState)

  const orderDetailHref =
    detailUrl ??
    accountOrderUrl ??
    (isAuthenticated ? routes.accountOrderDetail(orderNumber) : null)

  const isPendingLikeState =
    confirmationState === 'pendingAfterTimeout' ||
    confirmationState === 'failed' ||
    confirmationState === 'expired' ||
    confirmationState === 'cancelled'

  const showViewOrder =
    Boolean(orderDetailHref && (canViewDetails || isPendingLikeState)) ||
    (!isAuthenticated && !canViewDetails && onGuestDetailsClick)

  const viewOrderLabel =
    confirmationState === 'pendingAfterTimeout' ? 'Ver detalle de compra' : 'Ver pedido'

  const paidRedirectProgress =
    paidRedirectSecondsLeft !== null
      ? Math.round(
          ((PAID_ORDER_REDIRECT_SECONDS - paidRedirectSecondsLeft) /
            PAID_ORDER_REDIRECT_SECONDS) *
            100,
        )
      : 0

  return (
    <div className="space-y-4">
      {confirmationState === 'paid' && paidRedirectSecondsLeft !== null && paidRedirectUrl && (
        <div
          className="rounded-lg border border-success/30 bg-success/5 p-4"
          role="status"
          aria-live="polite"
        >
          <p className="font-sans text-sm font-medium text-foreground">
            Pago confirmado
          </p>
          <p className="mt-1 font-serif text-sm text-muted-foreground">
            Te llevamos a tu pedido en{' '}
            <span className="font-sans font-semibold text-foreground">
              {paidRedirectSecondsLeft}s
            </span>
            …
          </p>
          <Progress value={paidRedirectProgress} className="mt-3 h-1.5" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary" className="font-sans">
              <Link href={paidRedirectUrl}>Ver pedido ahora</Link>
            </Button>
            {onCancelPaidRedirect && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="font-sans"
                onClick={onCancelPaidRedirect}
              >
                Quedarme aquí
              </Button>
            )}
          </div>
        </div>
      )}

      {showWaitingNote && (
        <p className="font-serif text-sm text-muted-foreground">
          Podrás continuar cuando Conekta termine de confirmar el pago.
        </p>
      )}

      {actions.showVerifyAgain && onVerifyAgain && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="secondary"
            className="font-sans"
            disabled={isVerifying}
            onClick={onVerifyAgain}
          >
            {isVerifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isVerifying ? 'Verificando…' : 'Verificar pago nuevamente'}
          </Button>
          {verifyMessage && (
            <p className="font-serif text-sm text-muted-foreground" role="status">
              {verifyMessage}
            </p>
          )}
        </div>
      )}

      {showManualRetryPayment && (returnToken || (orderNumber && legacyEmail)) && (
        <CheckoutConektaPay
          returnToken={returnToken}
          orderNumber={orderNumber}
          email={legacyEmail}
          autoRedirect={false}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {showViewOrder && orderDetailHref && canViewDetails && (
          actions.disableViewOrder ? (
            <Button disabled className="font-sans">
              Ver pedido
            </Button>
          ) : (
            <Button asChild className="font-sans">
              <Link href={orderDetailHref}>
                {viewOrderLabel}
                {actions.viewOrderPendingBadge && (
                  <Badge
                    variant="outline"
                    className="ml-2 border-warning/40 bg-warning/10 text-warning"
                  >
                    Pago pendiente
                  </Badge>
                )}
              </Link>
            </Button>
          )
        )}

        {!isAuthenticated && !canViewDetails && onGuestDetailsClick && (
          actions.disableViewOrder ? (
            <Button disabled className="font-sans">
              Ver detalle del pedido
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              className="font-sans"
              onClick={onGuestDetailsClick}
            >
              Ver detalle del pedido
              {actions.viewOrderPendingBadge && (
                <Badge
                  variant="outline"
                  className="ml-2 border-warning/40 bg-warning/10 text-warning"
                >
                  Pago pendiente
                </Badge>
              )}
            </Button>
          )
        )}

        {!isAuthenticated && (
          <>
            <Button asChild variant="outline" className="font-sans">
              <Link href={loginUrl}>
                {confirmationState === 'pendingAfterTimeout'
                  ? 'Iniciar sesión para ver el pedido'
                  : 'Iniciar sesión'}
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-sans">
              <Link href={registerUrl}>Crear cuenta</Link>
            </Button>
          </>
        )}

        {claimUrl && !canViewDetails && !actions.disableViewOrder && (
          <Button asChild variant="outline" className="font-sans">
            <Link href={claimUrl}>Crear cuenta para ver seguimiento</Link>
          </Button>
        )}

        {isAuthenticated && !orderDetailHref && !actions.disableViewOrder && (
          <Button asChild variant="outline" className="font-sans">
            <Link href={routes.account}>Ir a mi cuenta</Link>
          </Button>
        )}

        {actions.disableContinueShopping ? (
          <Button disabled variant="outline" className="font-sans">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Seguir comprando
          </Button>
        ) : (
          <Button asChild variant="outline" className="font-sans">
            <Link href={routes.shop}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Seguir comprando
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
