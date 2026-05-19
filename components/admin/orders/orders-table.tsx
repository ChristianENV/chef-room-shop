'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MoreHorizontal,
  Eye,
  Factory,
  Truck,
  XCircle,
  Palette,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminOrder, AdminOrderStatus, AdminPaymentStatus, AdminProductionStatus } from '@/lib/types'

interface OrdersTableProps {
  orders: AdminOrder[]
  loading?: boolean
  onViewOrder: (order: AdminOrder) => void
  onMoveToProduction: (order: AdminOrder) => void
  onMarkReadyToShip: (order: AdminOrder) => void
  onAddTracking: (order: AdminOrder) => void
  onCancelOrder: (order: AdminOrder) => void
  onDownloadProductionSheet: (order: AdminOrder) => void
}

const orderStatusConfig: Record<AdminOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'pendiente-pago': { label: 'Pendiente pago', variant: 'outline' },
  'pagado': { label: 'Pagado', variant: 'default' },
  'en-produccion': { label: 'En produccion', variant: 'secondary' },
  'listo-envio': { label: 'Listo envio', variant: 'default' },
  'enviado': { label: 'Enviado', variant: 'secondary' },
  'entregado': { label: 'Entregado', variant: 'default' },
  'cancelado': { label: 'Cancelado', variant: 'destructive' },
}

const paymentStatusConfig: Record<AdminPaymentStatus, { label: string; color: string }> = {
  'pendiente': { label: 'Pendiente', color: 'text-warning' },
  'completado': { label: 'Completado', color: 'text-success' },
  'fallido': { label: 'Fallido', color: 'text-destructive' },
  'reembolsado': { label: 'Reembolsado', color: 'text-muted-foreground' },
  'parcial': { label: 'Parcial', color: 'text-warning' },
}

const productionStatusConfig: Record<AdminProductionStatus, { label: string; color: string }> = {
  'pendiente': { label: 'Pendiente', color: 'text-muted-foreground' },
  'en-cola': { label: 'En cola', color: 'text-warning' },
  'en-proceso': { label: 'En proceso', color: 'text-accent' },
  'revision': { label: 'Revision', color: 'text-primary' },
  'completado': { label: 'Completado', color: 'text-success' },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrdersTable({
  orders,
  loading,
  onViewOrder,
  onMoveToProduction,
  onMarkReadyToShip,
  onAddTracking,
  onCancelOrder,
  onDownloadProductionSheet,
}: OrdersTableProps) {
  if (loading) {
    return <OrdersTableSkeleton />
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="font-sans text-lg font-semibold text-foreground">
          No hay ordenes
        </h3>
        <p className="mt-1 font-serif text-sm text-muted-foreground">
          No se encontraron ordenes con los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Orden</TableHead>
            <TableHead className="font-sans">Cliente</TableHead>
            <TableHead className="font-sans text-center">Items</TableHead>
            <TableHead className="font-sans text-center">Diseno</TableHead>
            <TableHead className="font-sans">Pago</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans">Produccion</TableHead>
            <TableHead className="font-sans text-right">Total</TableHead>
            <TableHead className="font-sans">Fecha</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const hasCustomization = order.items.some(item => item.hasCustomization)
            const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
            const orderStatus = orderStatusConfig[order.status]
            const paymentStatus = paymentStatusConfig[order.paymentStatus]
            const productionStatus = productionStatusConfig[order.productionStatus]

            return (
              <TableRow key={order.id} className="cursor-pointer" onClick={() => onViewOrder(order)}>
                <TableCell>
                  <span className="font-mono text-sm font-medium text-foreground">
                    {order.orderNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">
                      {order.customer.name}
                    </p>
                    <p className="font-serif text-xs text-muted-foreground">
                      {order.customer.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-sans text-sm text-foreground">{totalItems}</span>
                </TableCell>
                <TableCell className="text-center">
                  {hasCustomization ? (
                    <Palette className="mx-auto h-4 w-4 text-accent" />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={cn('font-sans text-sm font-medium', paymentStatus.color)}>
                    {paymentStatus.label}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
                </TableCell>
                <TableCell>
                  <span className={cn('font-sans text-sm', productionStatus.color)}>
                    {productionStatus.label}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-sans font-semibold text-foreground">
                    {formatCurrency(order.total)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-serif text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewOrder(order); }}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      {order.status === 'pagado' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveToProduction(order); }}>
                          <Factory className="mr-2 h-4 w-4" />
                          Mover a produccion
                        </DropdownMenuItem>
                      )}
                      {order.status === 'en-produccion' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMarkReadyToShip(order); }}>
                          <Truck className="mr-2 h-4 w-4" />
                          Marcar listo envio
                        </DropdownMenuItem>
                      )}
                      {order.status === 'listo-envio' && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddTracking(order); }}>
                          <Truck className="mr-2 h-4 w-4" />
                          Agregar guia
                        </DropdownMenuItem>
                      )}
                      {hasCustomization && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownloadProductionSheet(order); }}>
                          <FileText className="mr-2 h-4 w-4" />
                          Hoja de produccion
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); onCancelOrder(order); }}
                        disabled={order.status === 'entregado' || order.status === 'cancelado'}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar orden
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function OrdersTableSkeleton() {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Orden</TableHead>
            <TableHead className="font-sans">Cliente</TableHead>
            <TableHead className="font-sans text-center">Items</TableHead>
            <TableHead className="font-sans text-center">Diseno</TableHead>
            <TableHead className="font-sans">Pago</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans">Produccion</TableHead>
            <TableHead className="font-sans text-right">Total</TableHead>
            <TableHead className="font-sans">Fecha</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </TableCell>
              <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-6" /></TableCell>
              <TableCell className="text-center"><Skeleton className="mx-auto h-4 w-4" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
