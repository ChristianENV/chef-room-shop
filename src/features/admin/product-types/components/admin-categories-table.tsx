'use client'

import { Archive, Pencil } from 'lucide-react'

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

import type { AdminCategoryTableRow } from '../types/admin-product-types-ui.types'

type AdminCategoriesTableProps = {
  rows: AdminCategoryTableRow[]
  onEdit: (row: AdminCategoryTableRow) => void
  onArchive: (row: AdminCategoryTableRow) => void
  actionCategoryId?: string | null
}

const statusBadgeClass: Record<string, string> = {
  active: 'border-success/30 bg-success/10 text-success',
  inactive: 'border-border bg-muted text-muted-foreground',
}

export function AdminCategoriesTable({
  rows,
  onEdit,
  onArchive,
  actionCategoryId,
}: AdminCategoriesTableProps) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-testid="admin-categories-table"
    >
      <Table className="min-w-[1080px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Nombre</TableHead>
            <TableHead className="font-sans">Slug interno</TableHead>
            <TableHead className="font-sans">Slug tienda</TableHead>
            <TableHead className="font-sans">Productos</TableHead>
            <TableHead className="font-sans">Activos</TableHead>
            <TableHead className="font-sans">Visible en navegación</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans">Orden</TableHead>
            <TableHead className="font-sans text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isBusy = actionCategoryId === row.id

            return (
              <TableRow key={row.id} data-testid={`admin-category-row-${row.id}`}>
                <TableCell>
                  <span className="font-sans text-sm font-medium text-foreground">{row.name}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">{row.slug}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">
                    {row.shopSlugLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-serif text-sm text-foreground">{row.productCount}</span>
                </TableCell>
                <TableCell>
                  <span className="font-serif text-sm text-foreground">
                    {row.activeProductCount}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-sans text-xs',
                      row.showInNav
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    {row.showInNavLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-sans text-xs',
                      row.isActive ? statusBadgeClass.active : statusBadgeClass.inactive,
                    )}
                  >
                    {row.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-serif text-sm text-muted-foreground">
                    {row.sortOrderLabel}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(row)}
                      disabled={isBusy}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Button>
                    {row.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onArchive(row)}
                        disabled={isBusy}
                      >
                        <Archive className="mr-1.5 h-3.5 w-3.5" />
                        Desactivar
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
