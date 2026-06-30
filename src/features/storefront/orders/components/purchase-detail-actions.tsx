'use client'

import Link from 'next/link'
import { Loader2, RefreshCw, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import { CheckoutConektaPay } from '@/src/features/storefront/checkout/checkout-conekta-pay'
import {
  getPaymentConfirmationActions,
  type PaymentConfirmationUxState,
} from '@/src/features/storefront/checkout/lib/payment-confirmation-state'

type PurchaseDetailActionsProps = {
  confirmationState: PaymentConfirmationUxState
  orderNumber: string
  returnToken?: string | null
  legacyEmail?: string
  onVerifyAgain?: () => void
  isVerifying?: boolean
  verifyMessage?: string | null
  showManualRetryPayment?: boolean
  canRetryPayment?: boolean
}

function shouldShowManualRetryPayment(state: PaymentConfirmationUxState): boolean {
  return (
    state === 'failed' ||
    state === 'expired' ||
    state === 'cancelled' ||
    state === 'pendingAfterTimeout'
  )
}

/**
 * Post-checkout payment verification and retry actions.
 */
export function PurchaseDetailActions({
  confirmationState,
  orderNumber,
  returnToken,
  legacyEmail,
  onVerifyAgain,
  isVerifying = false,
  verifyMessage,
  showManualRetryPayment,
  canRetryPayment = true,
}: PurchaseDetailActionsProps) {
  const actions = getPaymentConfirmationActions(confirmationState)
  const showRetry =
    (showManualRetryPayment ?? shouldShowManualRetryPayment(confirmationState)) &&
    canRetryPayment &&
    (returnToken || (orderNumber && legacyEmail))

  return (
    <section className="rounded-xl border border-border bg-card p-6" aria-label="Acciones de pago">
      {actions.showWaitingNote && (
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
            data-testid="verify-payment-button"
          >
            {isVerifying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isVerifying ? 'Verificando…' : 'Verificar pago'}
          </Button>
          {verifyMessage && (
            <p className="font-serif text-sm text-muted-foreground" role="status">
              {verifyMessage}
            </p>
          )}
        </div>
      )}

      {showRetry && (
        <div className="mt-4" data-testid="retry-payment-button">
          <CheckoutConektaPay
            returnToken={returnToken}
            orderNumber={orderNumber}
            email={legacyEmail}
            autoRedirect={false}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="outline" className="font-sans">
          <Link href={routes.contact}>Contactar soporte</Link>
        </Button>

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
    </section>
  )
}
