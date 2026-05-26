'use client'

import { Badge } from '@/components/ui/badge'

import { formatDateOnly, mapStatusToBadgeVariant } from '../mappers/admin-orders-ui.mapper'
import type { AdminOrderDetailState } from './use-admin-order-detail'

type AdminOrderDetailHeaderProps = {
  detail: AdminOrderDetailState
  titleId?: string
}

export function AdminOrderDetailHeader({ detail, titleId }: AdminOrderDetailHeaderProps) {
  const { order, bffOrder, actionMessage, actionError } = detail
  if (!order) return null

  return (
    <div className="border-b border-border pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id={titleId} className="font-sans text-xl font-semibold text-foreground">
            {order.orderNumber}
          </h2>
          <p className="mt-1 font-serif text-sm text-muted-foreground">
            {order.customer.name} · {order.customer.email}
          </p>
          <p className="mt-0.5 font-serif text-xs text-muted-foreground">
            Creado el {formatDateOnly(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={mapStatusToBadgeVariant(bffOrder?.status ?? order.status)}>
            {order.statusLabel}
          </Badge>
          <Badge variant="outline">{order.paymentStatusLabel}</Badge>
        </div>
      </div>
      {actionMessage ? (
        <p className="mt-2 font-serif text-sm text-success">{actionMessage}</p>
      ) : null}
      {actionError ? (
        <p className="mt-2 font-serif text-sm text-destructive">{actionError}</p>
      ) : null}
    </div>
  )
}
