'use client'
import { routes } from '@/src/config/routes'

import Link from 'next/link'
import { 
  ChevronRight,
  ExternalLink,
  Package,
  Truck,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Order, OrderStatus } from '@/lib/types'

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
  const statusConfig: Record<OrderStatus, { label: string; className: string; icon?: typeof Package }> = {
    'pendiente': { label: 'Pendiente', className: 'bg-warning/10 text-warning border-warning/30' },
    'pagado': { label: 'Pagado', className: 'bg-success/10 text-success border-success/30' },
    'en-produccion': { label: 'En produccion', className: 'bg-primary/10 text-primary border-primary/30', icon: Package },
    'enviado': { label: 'Enviado', className: 'bg-accent/10 text-accent border-accent/30', icon: Truck },
    'entregado': { label: 'Entregado', className: 'bg-success/10 text-success border-success/30' },
    'cancelado': { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  }

  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <p className="font-sans font-semibold text-foreground">
                {order.orderNumber}
              </p>
              <Badge variant="outline" className={cn('text-xs border', status.className)}>
                {StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
                {status.label}
              </Badge>
            </div>
            <p className="font-serif text-sm text-muted-foreground">
              {new Date(order.date).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-sans text-lg font-bold text-foreground">
              ${order.total.toLocaleString('es-MX')} MXN
            </p>
          </div>
        </div>

        {/* Items Preview */}
        <div className="flex flex-wrap gap-3 p-4">
          {order.items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2"
            >
              <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-foreground truncate max-w-[150px]">
                  {item.productName}
                </p>
                <p className="font-serif text-xs text-muted-foreground">
                  {item.size} / {item.color} x{item.quantity}
                </p>
                {item.hasCustomization && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Personalizado
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 border-t border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Delivery Info */}
          {order.estimatedDelivery && order.status !== 'entregado' && order.status !== 'cancelado' && (
            <p className="font-serif text-sm text-muted-foreground">
              Entrega estimada:{' '}
              <span className="font-medium text-foreground">
                {new Date(order.estimatedDelivery).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </p>
          )}
          
          {order.status === 'entregado' && (
            <p className="font-serif text-sm text-success">
              Entregado el {new Date(order.date).toLocaleDateString('es-MX')}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {order.trackingUrl && (order.status === 'enviado') && (
              <Button variant="outline" size="sm" asChild>
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                  <Truck className="mr-2 h-4 w-4" />
                  Rastrear envio
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/account/orders/${order.id}`}>
                Ver detalle
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface OrdersListProps {
  orders: Order[]
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
        <h3 className="font-sans text-lg font-semibold text-foreground">
          No tienes pedidos
        </h3>
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
