'use client'

import { CreditCard, Package, Receipt, Truck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import type { AdminOrdersUiOrder } from '../types/admin-orders-ui.types'

const paymentStatusColor: Record<string, string> = {
  pendiente: 'border-warning/40 bg-warning/10 text-warning',
  completado: 'border-success/40 bg-success/10 text-success',
  fallido: 'border-destructive/40 bg-destructive/10 text-destructive',
  reembolsado: 'border-border bg-muted text-muted-foreground',
}

type SummaryMetricProps = {
  label: string
  value: string
  sublabel?: string
  icon: typeof Receipt
  badge?: React.ReactNode
  className?: string
}

function SummaryMetric({
  label,
  value,
  sublabel,
  icon: Icon,
  badge,
  className,
}: SummaryMetricProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-sans text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p className="truncate font-sans text-xl font-bold tabular-nums text-foreground sm:text-2xl">
        {value}
      </p>
      {sublabel ? (
        <p className="mt-1 truncate font-serif text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
      {badge ? <div className="mt-3">{badge}</div> : null}
    </div>
  )
}

type AdminOrderSummaryStripProps = {
  order: AdminOrdersUiOrder
}

export function AdminOrderSummaryStrip({ order }: AdminOrderSummaryStripProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const hasCustomization = order.items.some((item) => item.hasCustomization)

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <SummaryMetric
        label="Total"
        value={formatCurrencyMXN(order.total)}
        sublabel={order.orderNumber}
        icon={Receipt}
      />
      <SummaryMetric
        label="Pago"
        value={order.paymentStatusLabel}
        sublabel={order.paymentMethod ?? 'Sin método registrado'}
        icon={CreditCard}
        badge={
          <Badge
            variant="outline"
            className={cn('font-sans text-xs', paymentStatusColor[order.paymentStatus])}
          >
            {order.paymentStatusLabel}
          </Badge>
        }
      />
      <SummaryMetric
        label="Envío"
        value={order.fulfillmentStatusLabel}
        sublabel={
          order.shipping === 0
            ? 'Costo de envío: Gratis'
            : `Costo: ${formatCurrencyMXN(order.shipping)}`
        }
        icon={Truck}
        badge={
          <Badge variant="secondary" className="font-sans text-xs">
            {order.productionStatusLabel}
          </Badge>
        }
      />
      <SummaryMetric
        label="Productos"
        value={String(itemCount)}
        sublabel={`${order.items.length} línea${order.items.length === 1 ? '' : 's'}`}
        icon={Package}
        badge={
          hasCustomization ? (
            <Badge className="font-sans text-xs">Con personalización</Badge>
          ) : (
            <Badge variant="outline" className="font-sans text-xs">
              Estándar
            </Badge>
          )
        }
      />
    </div>
  )
}
