'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, Printer } from 'lucide-react'

// TODO: Replace with TanStack Query for real-time orders
export interface AdminOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: 'pendiente' | 'pagado' | 'en-produccion' | 'enviado' | 'entregado' | 'cancelado'
  paymentStatus: 'pendiente' | 'completado' | 'fallido'
  total: number
  itemCount: number
  date: string
  hasCustomization: boolean
}

const statusConfig: Record<AdminOrder['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  pagado: { label: 'Pagado', variant: 'default' },
  'en-produccion': { label: 'En Produccion', variant: 'secondary' },
  enviado: { label: 'Enviado', variant: 'default' },
  entregado: { label: 'Entregado', variant: 'default' },
  cancelado: { label: 'Cancelado', variant: 'destructive' },
}

const paymentStatusConfig: Record<AdminOrder['paymentStatus'], { label: string; className: string }> = {
  pendiente: { label: 'Pendiente', className: 'text-warning' },
  completado: { label: 'Completado', className: 'text-success' },
  fallido: { label: 'Fallido', className: 'text-destructive' },
}

interface RecentOrdersTableProps {
  orders: AdminOrder[]
  className?: string
}

export function RecentOrdersTable({ orders, className }: RecentOrdersTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-sans text-base font-semibold">
          Órdenes Recientes
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href={routes.adminOrders}>Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-sans">Orden</TableHead>
              <TableHead className="font-sans">Cliente</TableHead>
              <TableHead className="font-sans">Estado</TableHead>
              <TableHead className="font-sans">Pago</TableHead>
              <TableHead className="font-sans text-right">Total</TableHead>
              <TableHead className="font-sans">Fecha</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = statusConfig[order.status]
              const payment = paymentStatusConfig[order.paymentStatus]

              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-sans text-sm font-medium">
                        {order.orderNumber}
                      </span>
                      {order.hasCustomization && (
                        <span className="font-serif text-xs text-primary">
                          Personalizado
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-sans text-sm">{order.customerName}</span>
                      <span className="font-serif text-xs text-muted-foreground">
                        {order.customerEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="font-sans">
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn('font-sans text-sm font-medium', payment.className)}>
                      {payment.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-sans text-sm font-semibold">
                      {formatCurrency(order.total)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-serif text-sm text-muted-foreground">
                      {formatDate(order.date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
