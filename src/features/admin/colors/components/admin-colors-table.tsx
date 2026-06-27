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

import type { AdminColorTableRow } from '../types/admin-colors-ui.types'

type AdminColorsTableProps = {
  rows: AdminColorTableRow[]
  onEdit: (row: AdminColorTableRow) => void
  onArchive: (row: AdminColorTableRow) => void
  actionColorId?: string | null
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block h-6 w-6 shrink-0 rounded-md border border-border shadow-sm"
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  )
}

export function AdminColorsTable({
  rows,
  onEdit,
  onArchive,
  actionColorId,
}: AdminColorsTableProps) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-testid="admin-colors-table"
    >
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Color</TableHead>
            <TableHead className="font-sans">Nombre</TableHead>
            <TableHead className="font-sans">Slug</TableHead>
            <TableHead className="font-sans">Hex</TableHead>
            <TableHead className="font-sans">Alcances</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans">Orden</TableHead>
            <TableHead className="font-sans text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isBusy = actionColorId === row.id

            return (
              <TableRow key={row.id} data-testid={`admin-color-row-${row.slug}`}>
                <TableCell>
                  <ColorSwatch hex={row.hexCode} />
                </TableCell>
                <TableCell>
                  <span className="font-sans text-sm font-medium">{row.name}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-muted-foreground">{row.slug}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm uppercase">{row.hexCode}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {row.scopes.map((scope) => (
                      <Badge key={scope} variant="secondary" className="font-sans text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-sans text-xs',
                      row.isActive
                        ? 'border-success/30 bg-success/10 text-success'
                        : 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    {row.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-serif text-sm">{row.sortOrder}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isBusy}
                      onClick={() => onEdit(row)}
                      data-testid={`admin-color-edit-${row.slug}`}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    {row.isActive ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={isBusy}
                        onClick={() => onArchive(row)}
                        data-testid={`admin-color-archive-${row.slug}`}
                      >
                        <Archive className="h-4 w-4" />
                        <span className="sr-only">Desactivar color</span>
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
