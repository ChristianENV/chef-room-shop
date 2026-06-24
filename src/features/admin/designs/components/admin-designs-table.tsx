'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Palette, ShoppingCart } from 'lucide-react'

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

import { AdminDesignsEmpty } from './admin-designs-empty'
import { AdminDesignsTableSkeleton } from './admin-designs-loading'
import type { AdminDesignsUiTableRow } from '../types'

type AdminDesignsTableProps = {
  rows: AdminDesignsUiTableRow[]
  loading?: boolean
  onRowClick?: (designId: string) => void
}

const statusBadgeClass: Record<string, string> = {
  DRAFT: 'border-border bg-muted text-muted-foreground',
  SAVED: 'border-accent/30 bg-accent/10 text-accent-foreground',
  IN_CART: 'border-warning/30 bg-warning/10 text-warning',
  PURCHASED: 'border-success/30 bg-success/10 text-success',
  ABANDONED: 'border-border bg-muted text-muted-foreground',
  ARCHIVED: 'border-border bg-muted text-muted-foreground',
}

function DesignPreviewThumb({ url }: { url: string | null }) {
  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
      {url ? (
        <Image src={url} alt="Vista previa" fill className="object-cover" unoptimized />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Palette className="size-5 text-muted-foreground/50" />
        </div>
      )}
    </div>
  )
}

export function AdminDesignsTable({ rows, loading, onRowClick }: AdminDesignsTableProps) {
  if (loading) {
    return <AdminDesignsTableSkeleton />
  }

  if (rows.length === 0) {
    return <AdminDesignsEmpty />
  }

  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-testid="admin-designs-table"
    >
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans w-[72px]">Preview</TableHead>
            <TableHead className="font-sans">ID</TableHead>
            <TableHead className="font-sans">Producto</TableHead>
            <TableHead className="font-sans">Cliente</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans text-right">Precio</TableHead>
            <TableHead className="font-sans">Creado</TableHead>
            <TableHead className="font-sans">Actualizado</TableHead>
            <TableHead className="font-sans">Relacionado</TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              data-testid={`admin-design-row-${row.id}`}
              onClick={() => onRowClick?.(row.id)}
            >
              <TableCell>
                <DesignPreviewThumb url={row.previewUrl} />
              </TableCell>
              <TableCell>
                <div>
                  <span className="font-mono text-sm font-medium text-foreground">
                    {row.shortId}
                  </span>
                  <p className="font-mono text-[10px] text-muted-foreground">{row.id}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-sans text-sm text-foreground">{row.productName}</span>
              </TableCell>
              <TableCell>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-sm font-medium text-foreground">
                      {row.customerName}
                    </p>
                    <Badge variant="outline" className="font-sans text-[10px]">
                      {row.ownerLabel}
                    </Badge>
                  </div>
                  {row.customerEmail ? (
                    <p className="font-mono text-xs text-muted-foreground">{row.customerEmail}</p>
                  ) : null}
                </div>
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
                  {row.finalPriceLabel}
                </span>
                {row.finalPriceLabel !== '—' ? (
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
                  {row.updatedAtLabel}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {row.relatedOrderNumber ? (
                    <Link
                      href={routes.adminOrderDetail(row.relatedOrderNumber)}
                      className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                      onClick={(event) => event.stopPropagation()}
                      data-testid={`admin-design-order-link-${row.relatedOrderNumber}`}
                    >
                      <ExternalLink className="size-3" />
                      {row.relatedOrderNumber}
                    </Link>
                  ) : null}
                  {row.relatedCartLabel ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <ShoppingCart className="size-3" />
                      {row.relatedCartLabel}
                    </span>
                  ) : null}
                  {!row.relatedOrderNumber && !row.relatedCartLabel ? (
                    <span className="font-serif text-xs text-muted-foreground">—</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(event) => {
                    event.stopPropagation()
                    onRowClick?.(row.id)
                  }}
                  aria-label={`Ver diseño ${row.shortId}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
