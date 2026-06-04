'use client'

import Image from 'next/image'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Archive,
  Palette,
  CheckCircle2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AdminProductTableRow } from './types/admin-products-ui.types'
import { STATUS_LABELS } from './mappers/admin-products-ui.mapper'
import type { AdminProductStatusUi } from './types/admin-products-ui.types'

interface ProductsTableProps {
  rows: AdminProductTableRow[]
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
  onEdit: (row: AdminProductTableRow) => void
  onDuplicate: (row: AdminProductTableRow) => void
  onArchive: (row: AdminProductTableRow) => void
  onStatusChange: (row: AdminProductTableRow, status: AdminProductStatusUi) => void
  actionProductId?: string | null
}

const STATUS_OPTIONS: AdminProductStatusUi[] = ['DRAFT', 'ACTIVE', 'ARCHIVED']

function ProductThumbnail({ url, alt }: { url: string | null; alt: string }) {
  if (!url) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
        <span className="font-serif text-[10px] text-muted-foreground">Sin img</span>
      </div>
    )
  }

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-md bg-secondary">
      <Image src={url} alt={alt} fill className="object-cover" sizes="40px" />
    </div>
  )
}

export function ProductsTable({
  rows,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDuplicate,
  onArchive,
  onStatusChange,
  actionProductId,
}: ProductsTableProps) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < rows.length

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Identificador</TableHead>
            <TableHead className="hidden lg:table-cell">Tipo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="hidden md:table-cell text-center">Variantes</TableHead>
            <TableHead className="hidden md:table-cell text-center">Personalizable</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="hidden lg:table-cell">Actualizado</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isSelected = selectedIds.includes(row.id)
            const isBusy = actionProductId === row.id

            return (
              <TableRow
                key={row.id}
                data-testid="admin-product-row"
                data-product-slug={row.slug}
                data-product-name={row.name}
                className={cn(
                  'transition-colors hover:bg-muted/40',
                  isSelected && 'bg-muted/50',
                  isBusy && 'opacity-60',
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectOne(row.id, checked === true)}
                    aria-label={`Seleccionar ${row.name}`}
                  />
                </TableCell>
                <TableCell>
                  <ProductThumbnail url={row.imageUrl} alt={row.imageAlt} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-foreground">{row.name}</span>
                    <span className="font-serif text-xs text-muted-foreground md:hidden">
                      {row.identifier}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="font-mono text-sm text-muted-foreground">{row.identifier}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="font-sans text-sm">{row.productTypeLabel}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-sans font-medium">{row.basePriceFormatted}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-center">
                  <span className="font-sans text-sm text-muted-foreground">{row.variantCount}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-center">
                  {row.customizable ? (
                    <Badge variant="outline" className="gap-1 font-sans text-xs">
                      <Palette className="h-3 w-3" />
                      Sí
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={row.statusBadgeVariant} className="font-sans">
                    {row.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="font-serif text-sm text-muted-foreground">
                    {row.updatedAtFormatted}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isBusy}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        data-testid="admin-product-edit-button"
                        data-product-slug={row.slug}
                        onClick={() => onEdit(row)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(row)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Cambiar estado
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {STATUS_OPTIONS.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={row.status === status}
                              onClick={() => onStatusChange(row, status)}
                            >
                              {STATUS_LABELS[status]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      {row.status !== 'ARCHIVED' ? (
                        <DropdownMenuItem onClick={() => onArchive(row)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archivar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onStatusChange(row, 'ACTIVE')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Reactivar
                        </DropdownMenuItem>
                      )}
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
