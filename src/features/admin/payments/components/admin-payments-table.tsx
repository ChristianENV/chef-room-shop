'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'

import { AdminPaymentsEmpty } from './admin-payments-empty'
import { AdminPaymentsTableSkeleton } from './admin-payments-loading'
import type { AdminPaymentsUiTableRow } from '../types'

type AdminPaymentsTableProps = {
  rows: AdminPaymentsUiTableRow[]
  loading?: boolean
}

const statusBadgeClass: Record<string, string> = {
  PENDING: 'border-warning/30 bg-warning/10 text-warning',
  AUTHORIZED: 'border-accent/30 bg-accent/10 text-accent-foreground',
  PAID: 'border-success/30 bg-success/10 text-success',
  FAILED: 'border-destructive/30 bg-destructive/10 text-destructive',
  REFUNDED: 'border-border bg-muted text-muted-foreground',
  PARTIALLY_REFUNDED: 'border-border bg-muted text-muted-foreground',
  CANCELLED: 'border-destructive/30 bg-destructive/10 text-destructive',
}

export function AdminPaymentsTable({ rows, loading }: AdminPaymentsTableProps) {
  if (loading) {
    return <AdminPaymentsTableSkeleton />
  }

  if (rows.length === 0) {
    return <AdminPaymentsEmpty />
  }

  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-testid="admin-payments-table"
    >
      <Table className="min-w-[1100px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Fecha</TableHead>
            <TableHead className="font-sans">Orden</TableHead>
            <TableHead className="font-sans">Cliente</TableHead>
            <TableHead className="font-sans">Proveedor</TableHead>
            <TableHead className="font-sans">Método</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans text-right">Monto</TableHead>
            <TableHead className="font-sans">ID proveedor</TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-testid={`admin-payment-row-${row.id}`}>
              <TableCell>
                <span className="font-serif text-sm text-muted-foreground">
                  {row.paymentDateLabel}
                </span>
              </TableCell>
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
                  <p className="font-mono text-xs text-muted-foreground">{row.customerEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-sans text-sm text-foreground">{row.providerLabel}</span>
              </TableCell>
              <TableCell>
                <span className="font-sans text-sm text-foreground">{row.methodLabel}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('font-sans text-xs', statusBadgeClass[row.status])}
                >
                  {row.statusLabel}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-sans text-sm font-semibold text-foreground">
                  {row.amountLabel}
                </span>
                <span className="ml-1 font-mono text-xs text-muted-foreground">{row.currency}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">
                  {row.providerPaymentIdMasked}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link
                    href={routes.adminOrderDetail(row.orderNumber)}
                    aria-label={`Ver orden ${row.orderNumber}`}
                    data-testid={`admin-payment-order-link-${row.orderNumber}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
