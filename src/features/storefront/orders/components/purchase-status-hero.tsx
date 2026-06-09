import { Loader2, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import type { AccountOrder } from '@/src/features/storefront/account/types'
import {
  getOrderItemCount,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getOrderStatusTone,
  getPaymentStatusLabel,
  orderHasCustomization,
} from '@/src/features/storefront/account/order-detail/order-detail.utils'
import type { PaymentConfirmationUxState } from '@/src/features/storefront/checkout/lib/payment-confirmation-state'
import { CHECKOUT_CONFIRMATION_VISUAL_MS } from '@/src/features/storefront/checkout/lib/checkout-polling.config'

type PurchaseStatusHeroProps = {
  order: AccountOrder
  confirmationState: PaymentConfirmationUxState
  elapsedMs: number
  isPolling?: boolean
}

function getPurchaseHeroCopy(state: PaymentConfirmationUxState): {
  title: string
  description: string
  testId: string
} {
  switch (state) {
    case 'loading':
    case 'confirming':
      return {
        title: 'Estamos confirmando tu pago',
        description:
          'Validamos la respuesta de Conekta. Esto puede tardar unos segundos.',
        testId: 'purchase-confirmation-loading',
      }
    case 'paid':
      return {
        title: 'Gracias por tu compra',
        description:
          'Tu pedido fue recibido correctamente. Puedes consultar el detalle y seguimiento aquí.',
        testId: 'purchase-payment-confirmed',
      }
    case 'failed':
      return {
        title: 'Tu pago no fue aprobado',
        description:
          'No pudimos confirmar el pago. Puedes reintentar o contactar a soporte.',
        testId: 'purchase-payment-failed',
      }
    case 'pendingAfterTimeout':
      return {
        title: 'Seguimos esperando confirmación del pago',
        description:
          'Tu pedido fue creado, pero Conekta aún no confirma el pago. Puedes verificar nuevamente.',
        testId: 'purchase-payment-timeout',
      }
    case 'expired':
    case 'cancelled':
      return {
        title: 'Tu pago está pendiente',
        description:
          'El intento de pago expiró o fue cancelado. Genera un nuevo intento para continuar.',
        testId: 'purchase-payment-pending',
      }
    default:
      return {
        title: 'Tu pago está pendiente',
        description: 'Estamos procesando la información de tu compra.',
        testId: 'purchase-payment-pending',
      }
  }
}

/**
 * Post-checkout hero with purchase confirmation messaging.
 */
export function PurchaseStatusHero({
  order,
  confirmationState,
  elapsedMs,
  isPolling,
}: PurchaseStatusHeroProps) {
  const tone = getOrderStatusTone(order.status)
  const copy = getPurchaseHeroCopy(confirmationState)
  const dateLabel = new Date(order.placedAt ?? order.createdAt).toLocaleDateString(
    'es-MX',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
  const hasCustomization = orderHasCustomization(order)
  const showProgress =
    (confirmationState === 'loading' || confirmationState === 'confirming') &&
    elapsedMs < CHECKOUT_CONFIRMATION_VISUAL_MS
  const progressValue = Math.min(
    100,
    Math.round((elapsedMs / CHECKOUT_CONFIRMATION_VISUAL_MS) * 100),
  )

  return (
    <section
      data-testid="purchase-status-hero"
      className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-6 md:p-8"
      aria-labelledby="purchase-hero-title"
    >
      <div
        data-testid={copy.testId}
        className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('font-sans text-xs', getOrderStatusBadgeClass(tone))}
            >
              {getOrderStatusLabel(order.status)}
            </Badge>
            <Badge variant="secondary" className="font-sans text-xs">
              Pago: {getPaymentStatusLabel(order.paymentStatus)}
            </Badge>
            {hasCustomization && (
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/5 font-sans text-xs text-primary"
              >
                <Sparkles className="h-3 w-3" aria-hidden />
                Con personalización
              </Badge>
            )}
            {isPolling && (
              <Badge variant="outline" className="gap-1 font-sans text-xs">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Actualizando
              </Badge>
            )}
          </div>

          <div>
            <p className="font-serif text-sm text-muted-foreground">Número de pedido</p>
            <h1
              id="purchase-hero-title"
              className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              {order.orderNumber}
            </h1>
          </div>

          <div>
            <p className="font-sans text-lg font-semibold text-foreground">{copy.title}</p>
            <p className="mt-1 max-w-xl font-serif text-sm leading-relaxed text-muted-foreground">
              {copy.description}
            </p>
          </div>

          {showProgress && (
            <div className="max-w-md space-y-2">
              <Progress value={progressValue} className="h-1.5" />
              <p className="font-serif text-xs text-muted-foreground">
                No cierres esta página mientras confirmamos el estado.
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 lg:items-end lg:text-right">
          <p className="font-serif text-sm text-muted-foreground">{dateLabel}</p>
          <p className="font-sans text-3xl font-bold text-primary">
            {formatCurrencyMXN(centsToPesos(order.totalCents))}
          </p>
          <p className="font-serif text-sm text-muted-foreground">
            {getOrderItemCount(order)} artículo{getOrderItemCount(order) !== 1 ? 's' : ''}
          </p>
          {order.customerEmail && (
            <p className="font-serif text-xs text-muted-foreground">
              Correo: {order.customerEmail}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
