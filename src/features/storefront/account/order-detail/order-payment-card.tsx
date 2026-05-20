import { CreditCard } from 'lucide-react'

import { CheckoutConektaPay } from '@/src/features/storefront/checkout/checkout-conekta-pay'
import { getPaymentStatusUi } from '@/src/features/storefront/checkout/lib/payment-status-ui'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import type { AccountOrder } from '../types'
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from './order-detail.utils'

type OrderPaymentCardProps = {
  order: AccountOrder
}

/**
 * Payment summary with optional Conekta pay/retry CTA.
 */
export function OrderPaymentCard({ order }: OrderPaymentCardProps) {
  const payment = order.payments[0]
  const statusUi = getPaymentStatusUi({
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
  })
  const email = order.customerEmail ?? ''

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

      {(statusUi.canPay || statusUi.canRetryPayment) && email && (
        <div className="mt-6 border-t border-border pt-6">
          <CheckoutConektaPay
            orderNumber={order.orderNumber}
            email={email}
            mode={statusUi.canRetryPayment ? 'retry' : 'prepare'}
          />
        </div>
      )}
    </section>
  )
}
