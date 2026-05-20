import { Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import type { AccountOrder } from '../types'
import {
  getOrderItemCount,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getOrderStatusMessage,
  getOrderStatusTone,
  getPaymentStatusLabel,
  orderHasCustomization,
} from './order-detail.utils'

type OrderStatusHeroProps = {
  order: AccountOrder
}

/**
 * Premium hero card with order summary and contextual status message.
 */
export function OrderStatusHero({ order }: OrderStatusHeroProps) {
  const tone = getOrderStatusTone(order.status)
  const dateLabel = new Date(order.placedAt ?? order.createdAt).toLocaleDateString(
    'es-MX',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
  const hasCustomization = orderHasCustomization(order)

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-6 md:p-8"
      aria-labelledby="order-hero-title"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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
          </div>

          <div>
            <p className="font-serif text-sm text-muted-foreground">Número de pedido</p>
            <h1
              id="order-hero-title"
              className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              {order.orderNumber}
            </h1>
          </div>

          <p className="max-w-xl font-serif text-sm leading-relaxed text-muted-foreground">
            {getOrderStatusMessage(order.status)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1 lg:items-end lg:text-right">
          <p className="font-serif text-sm text-muted-foreground">{dateLabel}</p>
          <p className="font-sans text-3xl font-bold text-primary">
            {formatCurrencyMXN(centsToPesos(order.totalCents))}
          </p>
          <p className="font-serif text-sm text-muted-foreground">
            {getOrderItemCount(order)} artículo{getOrderItemCount(order) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </section>
  )
}
