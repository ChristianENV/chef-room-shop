'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import type { AccountOrder } from '@/src/features/storefront/account/types'
import { OrderEventsCard } from '@/src/features/storefront/account/order-detail/order-events-card'
import { OrderItemsCard } from '@/src/features/storefront/account/order-detail/order-items-card'
import { OrderPaymentCard } from '@/src/features/storefront/account/order-detail/order-payment-card'
import { OrderProgressTimeline } from '@/src/features/storefront/account/order-detail/order-progress-timeline'
import { OrderShippingCard } from '@/src/features/storefront/account/order-detail/order-shipping-card'
import { OrderSupportCard } from '@/src/features/storefront/account/order-detail/order-support-card'
import { OrderTotalsCard } from '@/src/features/storefront/account/order-detail/order-totals-card'
import type { PaymentConfirmationUxState } from '@/src/features/storefront/checkout/lib/payment-confirmation-state'
import { GuestOrderAccountCta } from './guest-order-account-cta'
import { OrderDetailLayout } from './order-detail-layout'
import { PurchaseDetailActions } from './purchase-detail-actions'
import { PurchaseStatusHero } from './purchase-status-hero'

type PurchaseDetailPageContentProps = {
  order: AccountOrder
  confirmationState: PaymentConfirmationUxState
  elapsedMs: number
  isPolling?: boolean
  isAuthenticated: boolean
  canViewDetails?: boolean
  viewerEmailMatchesOrder?: boolean
  loginUrl: string
  registerUrl: string
  claimUrl?: string | null
  returnToken?: string | null
  legacyEmail?: string
  tokenExpired?: boolean
  onVerifyAgain?: () => void
  isVerifying?: boolean
  verifyMessage?: string | null
  showManualRetryPayment?: boolean
  paymentReference?: string | null
  paymentExpiresAt?: string | null
  cashPaymentLocations?: string[] | null
}

/**
 * Unified post-checkout purchase detail (order-detail layout + payment polling).
 */
export function PurchaseDetailPageContent({
  order,
  confirmationState,
  elapsedMs,
  isPolling,
  isAuthenticated,
  canViewDetails,
  viewerEmailMatchesOrder = true,
  loginUrl,
  registerUrl,
  claimUrl,
  returnToken,
  legacyEmail,
  tokenExpired,
  onVerifyAgain,
  isVerifying,
  verifyMessage,
  showManualRetryPayment,
  paymentReference,
  paymentExpiresAt,
  cashPaymentLocations,
}: PurchaseDetailPageContentProps) {
  const showGuestCta = !isAuthenticated && !canViewDetails
  const showEmailMismatch = isAuthenticated && !canViewDetails && viewerEmailMatchesOrder === false

  return (
    <div data-testid="purchase-detail-page" className="space-y-6">
      {tokenExpired && (
        <Alert>
          <AlertDescription className="font-serif text-sm">
            El enlace de confirmación expiró. Inicia sesión o crea una cuenta con el mismo correo
            del pedido para consultarlo, o contacta a soporte.
          </AlertDescription>
        </Alert>
      )}

      {showEmailMismatch && (
        <Alert>
          <AlertDescription className="font-serif text-sm">
            Esta compra fue realizada con otro correo. Podemos ayudarte a asociarla si contactas a
            soporte o usas el enlace del correo de confirmación.
          </AlertDescription>
        </Alert>
      )}

      <OrderDetailLayout
        hero={
          <PurchaseStatusHero
            order={order}
            confirmationState={confirmationState}
            elapsedMs={elapsedMs}
            isPolling={isPolling}
          />
        }
        timeline={<OrderProgressTimeline order={order} />}
        items={<OrderItemsCard order={order} />}
        events={order.events.length > 0 ? <OrderEventsCard order={order} /> : undefined}
        sidebar={
          <>
            {showGuestCta && (
              <GuestOrderAccountCta
                loginUrl={loginUrl}
                registerUrl={registerUrl}
                claimUrl={claimUrl}
              />
            )}
            <PurchaseDetailActions
              confirmationState={confirmationState}
              orderNumber={order.orderNumber}
              returnToken={returnToken}
              legacyEmail={legacyEmail}
              onVerifyAgain={onVerifyAgain}
              isVerifying={isVerifying}
              verifyMessage={verifyMessage}
              showManualRetryPayment={showManualRetryPayment}
            />
            <OrderPaymentCard order={order} hideAccountActions />
            <OrderShippingCard order={order} />
            <OrderTotalsCard order={order} />
            {(paymentReference || paymentExpiresAt) && (
              <section className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-sans text-lg font-semibold text-foreground">
                  Referencia de pago
                </h2>
                <dl className="mt-4 space-y-2 font-serif text-sm">
                  {paymentReference && (
                    <div>
                      <dt className="text-muted-foreground">Referencia</dt>
                      <dd className="font-sans font-medium text-foreground">{paymentReference}</dd>
                    </div>
                  )}
                  {paymentExpiresAt && (
                    <div>
                      <dt className="text-muted-foreground">Vence</dt>
                      <dd className="font-sans font-medium text-foreground">
                        {new Date(paymentExpiresAt).toLocaleString('es-MX')}
                      </dd>
                    </div>
                  )}
                </dl>
                {cashPaymentLocations && cashPaymentLocations.length > 0 && (
                  <ul className="mt-3 list-inside list-disc font-serif text-sm text-muted-foreground">
                    {cashPaymentLocations.slice(0, 10).map((location) => (
                      <li key={location}>{location}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}
            <OrderSupportCard orderNumber={order.orderNumber} />
          </>
        }
      />
    </div>
  )
}
