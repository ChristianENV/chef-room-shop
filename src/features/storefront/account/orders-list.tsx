'use client'

import { useState } from 'react'
import { routes } from '@/src/config/routes'

import Link from 'next/link'
import { ChevronRight, ExternalLink, Package, Truck } from 'lucide-react'

import { ProductImageDisplay } from '@/components/shared/product-image'
import { parseProductSnapshot } from '@/src/features/storefront/account/order-detail/order-detail.utils'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderPaymentActions } from '@/src/features/storefront/account/components/order-payment-actions'
import { resolvePaymentActionsForOrder } from '@/src/features/storefront/account/lib/resolve-payment-actions'
import type {
  AccountOrder,
  AccountPaymentStatusPayload,
} from '@/src/features/storefront/account/types'
import { centsToPesos } from '@/src/lib/formatters'

interface OrderCardProps {
  order: AccountOrder
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: {
    label: 'Pendiente',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  PAYMENT_FAILED: {
    label: 'Pendiente',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  PAID: { label: 'Pagado', className: 'bg-success/10 text-success border-success/30' },
  IN_PRODUCTION: {
    label: 'En produccion',
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  READY_TO_SHIP: {
    label: 'En produccion',
    className: 'bg-primary/10 text-primary border-primary/30',
  },
  SHIPPED: { label: 'Enviado', className: 'bg-accent/10 text-accent border-accent/30' },
  DELIVERED: { label: 'Entregado', className: 'bg-success/10 text-success border-success/30' },
  CANCELLED: {
    label: 'Cancelado',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  REFUNDED: {
    label: 'Cancelado',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
}

export function OrderCard({ order }: OrderCardProps) {
  const [verified, setVerified] = useState<AccountPaymentStatusPayload | null>(null)

  const displayStatus = verified?.orderStatus ?? order.status
  const displayPaymentStatus = verified?.paymentStatus ?? order.paymentStatus
  const status = STATUS_LABELS[displayStatus] ?? STATUS_LABELS.PENDING_PAYMENT
  const paymentActions = resolvePaymentActionsForOrder({
    ...order,
    status: displayStatus,
    paymentStatus: displayPaymentStatus,
  })

  const date = order.placedAt ?? order.createdAt
  const shipment = order.shipments?.[0]
  const trackingNumber = shipment?.trackingNumber ?? undefined

  const showPaymentActions =
    paymentActions.canVerifyPayment ||
    paymentActions.canContinuePayment ||
    paymentActions.canRetryPayment

  const paidMessage = verified?.paymentStatus === 'PAID' ? verified.message : null

  return (
    <Card className="overflow-hidden border-border bg-card transition-shadow duration-200 hover:border-primary/20 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <p className="font-sans font-semibold text-foreground">{order.orderNumber}</p>
              <Badge variant="outline" className={cn('text-xs border', status.className)}>
                {status.label}
              </Badge>
            </div>
            <p className="font-serif text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-sans text-lg font-bold text-foreground">
              ${centsToPesos(order.totalCents).toLocaleString('es-MX')} MXN
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 p-4">
          {order.items.map((item) => {
            const snapshot = parseProductSnapshot(item.productSnapshotJson)
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <ProductImageDisplay
                    src={snapshot.imageUrl}
                    alt={item.name}
                    className="absolute inset-0"
                    placeholderIconClassName="h-5 w-5"
                  />
                </div>
                <div className="min-w-0">
                  <p className="max-w-[150px] truncate font-sans text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="font-serif text-xs text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          {trackingNumber && (
            <span className="font-serif text-sm text-muted-foreground">Guía: {trackingNumber}</span>
          )}

          <div className="flex flex-col gap-3 sm:items-end">
            {paidMessage && (
              <p className="font-serif text-sm text-success" role="status">
                {paidMessage}
              </p>
            )}
            {showPaymentActions && (
              <OrderPaymentActions
                orderNumber={order.orderNumber}
                paymentActions={paymentActions}
                paymentStatus={displayPaymentStatus}
                orderStatus={displayStatus}
                variant="list"
                onVerified={setVerified}
              />
            )}

            <div className="flex items-center gap-2">
              {trackingNumber && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Rastrear envio
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href={routes.accountOrderDetail(order.orderNumber)}>
                  Ver detalle
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface OrdersListProps {
  orders: AccountOrder[]
  isLoading?: boolean
}

export function OrdersList({ orders, isLoading }: OrdersListProps) {
  if (isLoading) {
    return <OrdersListSkeleton />
  }

  if (orders.length === 0) {
    return <OrdersEmptyState />
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

function OrdersListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-secondary" />
                  <div className="h-4 w-24 rounded bg-secondary" />
                </div>
                <div className="h-6 w-24 rounded bg-secondary" />
              </div>
              <div className="flex gap-3">
                <div className="h-16 w-16 rounded-lg bg-secondary" />
                <div className="h-16 w-16 rounded-lg bg-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function OrdersEmptyState() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-secondary p-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-sans text-lg font-semibold text-foreground">No tienes pedidos</h3>
        <p className="mt-1 max-w-sm font-serif text-muted-foreground">
          Cuando realices tu primer pedido, aparecera aqui para que puedas darle seguimiento.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href={routes.shop}>Explorar catálogo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={routes.customize}>Disenar uniforme</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
