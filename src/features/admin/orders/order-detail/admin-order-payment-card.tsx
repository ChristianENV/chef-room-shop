'use client'

import { Copy, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { AdminOrdersUiOrder } from '../types/admin-orders-ui.types'

const paymentStatusColor: Record<string, string> = {
  pendiente: 'text-warning',
  completado: 'text-success',
  fallido: 'text-destructive',
  reembolsado: 'text-muted-foreground',
}

type AdminOrderPaymentCardProps = {
  order: AdminOrdersUiOrder
  onCopyReference?: (value: string) => void
}

export function AdminOrderPaymentCard({ order, onCopyReference }: AdminOrderPaymentCardProps) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-lg border border-border/80 bg-muted/20 p-4">
      <h4 className="mb-4 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <CreditCard className="h-3.5 w-3.5" aria-hidden />
        Pago
      </h4>
      <dl className="space-y-3 font-serif text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-muted-foreground">Estado</dt>
          <dd
            className={cn(
              'text-right font-sans font-medium',
              paymentStatusColor[order.paymentStatus],
            )}
          >
            {order.paymentStatusLabel}
          </dd>
        </div>
        {order.paymentMethod ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted-foreground">Método</dt>
            <dd className="text-right font-sans">{order.paymentMethod}</dd>
          </div>
        ) : null}
        {order.paymentReference ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Referencia</dt>
            <dd className="flex min-w-0 items-center justify-end gap-1">
              <span className="truncate font-mono text-xs">{order.paymentReference}</span>
              {onCopyReference ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => onCopyReference(order.paymentReference!)}
                  aria-label="Copiar referencia de pago"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
