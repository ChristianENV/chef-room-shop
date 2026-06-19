'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { formatDateOnly, mapStatusToBadgeVariant } from '../mappers/admin-orders-ui.mapper'
import type { AdminOrderDetailState } from './use-admin-order-detail'

type AdminOrderDetailHeaderProps = {
  detail: AdminOrderDetailState
  titleId?: string
  variant?: 'page' | 'modal'
}

export function AdminOrderDetailHeader({
  detail,
  titleId,
  variant = 'page',
}: AdminOrderDetailHeaderProps) {
  const { order, bffOrder, actionMessage, actionError } = detail
  if (!order) return null

  return (
    <header
      className={cn(
        'rounded-xl border border-border bg-card shadow-sm',
        variant === 'page' ? 'p-5 sm:p-6' : 'border-0 bg-transparent p-0 shadow-none',
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1
            id={titleId}
            className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {order.orderNumber}
          </h1>
          <p className="mt-2 font-sans text-base font-medium text-foreground">
            {order.customer.name}
          </p>
          <p className="mt-0.5 break-all font-serif text-sm text-muted-foreground">
            {order.customer.email}
          </p>
          <p className="mt-2 font-serif text-sm text-muted-foreground">
            Creado el {formatDateOnly(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Badge variant={mapStatusToBadgeVariant(bffOrder?.status ?? order.status)}>
            {order.statusLabel}
          </Badge>
          <Badge variant="outline">{order.paymentStatusLabel}</Badge>
          <Badge variant="secondary">{order.fulfillmentStatusLabel}</Badge>
        </div>
      </div>
      {actionMessage ? (
        <p className="mt-4 font-serif text-sm text-success">{actionMessage}</p>
      ) : null}
      {actionError ? (
        <p className="mt-4 font-serif text-sm text-destructive">{actionError}</p>
      ) : null}
    </header>
  )
}
