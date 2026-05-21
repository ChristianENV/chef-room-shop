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

import { AdminOrdersEmpty } from './components/admin-orders-empty'
import { AdminOrdersTableSkeleton } from './components/admin-orders-loading'
import type { AdminOrdersUiTableRow } from './types/admin-orders-ui.types'

interface OrdersTableProps {
  rows: AdminOrdersUiTableRow[]
  loading?: boolean
  onViewOrder: (orderNumber: string) => void
  onMoveToProduction: (orderNumber: string) => void
  onMarkReadyToShip: (orderNumber: string) => void
  onAddTracking: (orderNumber: string) => void
  onCancelOrder: (orderNumber: string) => void
  onOpenProductionSheet: (orderNumber: string) => void
  actionOrderNumber?: string | null
}

const paymentStatusColor: Record<string, string> = {
  pendiente: 'text-warning',
  completado: 'text-success',
  fallido: 'text-destructive',
  reembolsado: 'text-muted-foreground',
}

export function OrdersTable({
  rows,
  loading,
  onViewOrder,
  onMoveToProduction,
  onMarkReadyToShip,
  onAddTracking,
  onCancelOrder,
  onOpenProductionSheet,
  actionOrderNumber,
}: OrdersTableProps) {
  if (loading) {
    return <AdminOrdersTableSkeleton />
  }

  if (rows.length === 0) {
    return <AdminOrdersEmpty />
  }

  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Orden</TableHead>
            <TableHead className="font-sans">Cliente</TableHead>
            <TableHead className="font-sans text-center">Items</TableHead>
            <TableHead className="font-sans text-center">Diseño</TableHead>
            <TableHead className="font-sans">Pago</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans">Fulfillment</TableHead>
            <TableHead className="font-sans text-right">Total</TableHead>
            <TableHead className="font-sans">Creado</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isBusy = actionOrderNumber === row.orderNumber

            return (
              <TableRow
                key={row.id}
                className={cn('cursor-pointer hover:bg-muted/40', isBusy && 'opacity-60')}
                onClick={() => onViewOrder(row.orderNumber)}
              >
                <TableCell>
                  <span className="font-mono text-sm font-medium text-foreground">
                    {row.orderNumber}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">
                      {row.customerName}
                    </p>
                    <p className="font-serif text-xs text-muted-foreground">
                      {row.customerEmail}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-sans text-sm text-foreground">{row.itemCount}</span>
                </TableCell>
                <TableCell className="text-center">
                  {row.hasCustomization ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Palette className="h-3 w-3" />
                      Sí
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'font-sans text-sm font-medium',
                      paymentStatusColor[row.paymentStatus] ?? 'text-foreground',
                    )}
                  >
                    {row.paymentStatusLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={row.statusBadgeVariant}>{row.statusLabel}</Badge>
                </TableCell>
                <TableCell>
                  <span className="font-sans text-sm text-muted-foreground">
                    {row.productionStatusLabel}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-sans font-semibold text-foreground">
                    {row.totalFormatted}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-serif text-xs text-muted-foreground">
                    {row.createdAtFormatted}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewOrder(row.orderNumber)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      {row.order.canMoveToProduction && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onMoveToProduction(row.orderNumber)
                          }}
                        >
                          <Factory className="mr-2 h-4 w-4" />
                          Mover a producción
                        </DropdownMenuItem>
                      )}
                      {row.order.canMarkReadyToShip && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onMarkReadyToShip(row.orderNumber)
                          }}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Marcar lista para envío
                        </DropdownMenuItem>
                      )}
                      {row.order.canAddTracking && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onAddTracking(row.orderNumber)
                          }}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Agregar guía
                        </DropdownMenuItem>
                      )}
                      {row.hasCustomization && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenProductionSheet(row.orderNumber)
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Ficha de producción
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCancelOrder(row.orderNumber)
                        }}
                        disabled={!row.order.canCancel}
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
