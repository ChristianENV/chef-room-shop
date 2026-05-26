'use client'

import { Receipt } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import type { AdminOrdersUiOrder } from '../types/admin-orders-ui.types'

type AdminOrderFinancialSummaryProps = {
  order: AdminOrdersUiOrder
}

export function AdminOrderFinancialSummary({ order }: AdminOrderFinancialSummaryProps) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-lg border border-border/80 bg-muted/20 p-4">
      <h4 className="mb-4 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Receipt className="h-3.5 w-3.5" aria-hidden />
        Desglose
      </h4>
      <dl className="space-y-2.5 font-serif text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-sans tabular-nums">{formatCurrencyMXN(order.subtotal)}</dd>
        </div>
        {order.customizationTotal > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Personalización</dt>
            <dd className="font-sans tabular-nums">
              {formatCurrencyMXN(order.customizationTotal)}
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Envío</dt>
          <dd className="font-sans tabular-nums">
            {order.shipping === 0 ? 'Gratis' : formatCurrencyMXN(order.shipping)}
          </dd>
        </div>
        {order.discount > 0 ? (
          <div className="flex justify-between gap-4 text-success">
            <dt>Descuento</dt>
            <dd className="font-sans tabular-nums">-{formatCurrencyMXN(order.discount)}</dd>
          </div>
        ) : null}
        {order.tax > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Impuestos</dt>
            <dd className="font-sans tabular-nums">{formatCurrencyMXN(order.tax)}</dd>
          </div>
        ) : null}
      </dl>
      <Separator className="my-4" />
      <div className="flex items-baseline justify-between gap-4 rounded-lg bg-primary/5 px-3 py-3">
        <span className="font-sans text-sm font-semibold text-primary">Total</span>
        <span className="font-sans text-xl font-bold tabular-nums text-primary">
          {formatCurrencyMXN(order.total)}
        </span>
      </div>
    </div>
  )
}
