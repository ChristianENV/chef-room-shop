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

import { mapShipmentStatusToBadgeVariant } from '../mappers/admin-shipments-list-ui.mapper'
import { AdminShipmentsEmpty } from './admin-shipments-empty'
import { AdminShipmentsTableSkeleton } from './admin-shipments-loading'
import type { AdminShipmentsUiTableRow } from '../types'

type AdminShipmentsTableProps = {
  rows: AdminShipmentsUiTableRow[]
  loading?: boolean
}

const statusBadgeClass: Record<string, string> = {
  PENDING: 'border-warning/30 bg-warning/10 text-warning',
  LABEL_CREATED: 'border-accent/30 bg-accent/10 text-accent-foreground',
  IN_TRANSIT: 'border-accent/30 bg-accent/10 text-accent-foreground',
  OUT_FOR_DELIVERY: 'border-accent/30 bg-accent/10 text-accent-foreground',
  DELIVERED: 'border-success/30 bg-success/10 text-success',
  FAILED: 'border-destructive/30 bg-destructive/10 text-destructive',
  RETURNED: 'border-border bg-muted text-muted-foreground',
  CANCELLED: 'border-destructive/30 bg-destructive/10 text-destructive',
}

export function AdminShipmentsTable({ rows, loading }: AdminShipmentsTableProps) {
  if (loading) {
    return <AdminShipmentsTableSkeleton />
  }

  if (rows.length === 0) {
    return <AdminShipmentsEmpty />
  }

  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-testid="admin-shipments-table"
    >
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Orden</TableHead>
            <TableHead className="font-sans">Cliente</TableHead>
            <TableHead className="font-sans">Estado envío</TableHead>
            <TableHead className="font-sans">Paquetería</TableHead>
            <TableHead className="font-sans">Rastreo</TableHead>
            <TableHead className="font-sans">Etiqueta</TableHead>
            <TableHead className="font-sans text-right">Costo</TableHead>
            <TableHead className="font-sans">Creado</TableHead>
            <TableHead className="font-sans">Último seguimiento</TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-testid={`admin-shipment-row-${row.id}`}>
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
                <Badge
                  variant={mapShipmentStatusToBadgeVariant(row.status)}
                  className={cn('font-sans text-xs', statusBadgeClass[row.status])}
                >
                  {row.statusLabel}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-sans text-sm text-foreground">{row.carrier}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs text-muted-foreground">{row.trackingNumber}</span>
              </TableCell>
              <TableCell>
                <span className="font-sans text-sm text-foreground">{row.labelStatus}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-sans text-sm font-semibold text-foreground">
                  {row.costLabel}
                </span>
                {row.costLabel !== '—' ? (
                  <span className="ml-1 font-mono text-xs text-muted-foreground">
                    {row.currency}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                <span className="font-serif text-sm text-muted-foreground">
                  {row.createdAtLabel}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-serif text-sm text-muted-foreground">
                  {row.trackingUpdatedAtLabel}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link
                    href={routes.adminOrderDetail(row.orderNumber)}
                    aria-label={`Ver orden ${row.orderNumber}`}
                    data-testid={`admin-shipment-order-link-${row.orderNumber}`}
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
