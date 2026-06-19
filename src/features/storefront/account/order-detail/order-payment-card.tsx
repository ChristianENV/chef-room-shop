import { CreditCard } from 'lucide-react'

import { OrderPaymentActions } from '@/src/features/storefront/account/components/order-payment-actions'
import { resolvePaymentActionsForOrder } from '@/src/features/storefront/account/lib/resolve-payment-actions'
import { getPaymentStatusUi } from '@/src/features/storefront/checkout/lib/payment-status-ui'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import type { AccountOrder } from '../types'
import { getPaymentMethodLabel, getPaymentStatusLabel } from './order-detail.utils'

type OrderPaymentCardProps = {
  order: AccountOrder
  /** Hides account-only verify/retry actions (e.g. token-scoped purchase page). */
  hideAccountActions?: boolean
}

/**
 * Payment summary with manual verify / continue / retry actions.
 */
export function OrderPaymentCard({ order, hideAccountActions = false }: OrderPaymentCardProps) {
  const payment = order.payments[0]
  const paymentActions = resolvePaymentActionsForOrder(order)
  const statusUi = getPaymentStatusUi({
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
  })

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="order-payment-title"
    >
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" aria-hidden />
        <h2 id="order-payment-title" className="font-sans text-lg font-semibold text-foreground">
          Pago
        </h2>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-secondary/20 p-4">
        <h3 className="font-sans text-sm font-semibold text-foreground">Estado de pago</h3>
        <p className="mt-1 font-serif text-sm text-muted-foreground">{statusUi.description}</p>
        <BadgeLike label={statusUi.badgeLabel} tone={statusUi.tone} />
      </div>

      {payment ? (
        <dl className="mt-4 space-y-2 font-serif text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Método</dt>
            <dd className="font-sans font-medium text-foreground">
              {getPaymentMethodLabel(payment.method)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Estado</dt>
            <dd className="font-sans font-medium text-foreground">
              {getPaymentStatusLabel(payment.status)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Monto</dt>
            <dd className="font-sans font-medium text-foreground">
              {formatCurrencyMXN(centsToPesos(payment.amountCents))}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Proveedor</dt>
            <dd className="font-sans font-medium text-foreground">
              {payment.provider === 'CONEKTA' ? 'Conekta' : payment.provider}
            </dd>
          </div>
          {payment.paidAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Fecha de pago</dt>
              <dd className="font-sans font-medium text-foreground">
                {new Date(payment.paidAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <p className="mt-4 font-serif text-sm text-muted-foreground">
          No hay información de pago disponible.
        </p>
      )}

      {!hideAccountActions && (
        <div className="mt-6 border-t border-border pt-6">
          <OrderPaymentActions
            orderNumber={order.orderNumber}
            paymentActions={paymentActions}
            paymentStatus={order.paymentStatus}
            orderStatus={order.status}
            variant="detail"
          />
        </div>
      )}
    </section>
  )
}

function BadgeLike({
  label,
  tone,
}: {
  label: string
  tone: 'pending' | 'success' | 'error' | 'neutral'
}) {
  const className =
    tone === 'success'
      ? 'text-success border-success/30 bg-success/10'
      : tone === 'error'
        ? 'text-destructive border-destructive/30 bg-destructive/10'
        : tone === 'pending'
          ? 'text-warning border-warning/30 bg-warning/10'
          : 'text-muted-foreground border-border bg-secondary/30'

  return (
    <span
      className={`mt-2 inline-flex items-center rounded-md border px-2 py-0.5 font-sans text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}
