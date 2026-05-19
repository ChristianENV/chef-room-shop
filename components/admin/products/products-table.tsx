'use client'

import Image from 'next/image'
import { MoreHorizontal, Eye, Pencil, Copy, Archive, Trash2, Check, Palette } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminProduct, AdminProductStatus } from '@/lib/types'

const statusConfig: Record<AdminProductStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  activo: { label: 'Activo', variant: 'default' },
  borrador: { label: 'Borrador', variant: 'secondary' },
  archivado: { label: 'Archivado', variant: 'outline' },
}

const categoryLabels: Record<string, string> = {
  filipinas: 'Filipinas',
  mandiles: 'Mandiles',
  pantalones: 'Pantalones',
  accesorios: 'Accesorios',
}

interface ProductsTableProps {
  products: AdminProduct[]
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
  onView: (product: AdminProduct) => void
  onEdit: (product: AdminProduct) => void
  onDuplicate: (product: AdminProduct) => void
  onArchive: (product: AdminProduct) => void
  onDelete: (product: AdminProduct) => void
}

export function ProductsTable({
  products,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onView,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: ProductsTableProps) {
  const allSelected = products.length > 0 && selectedIds.length === products.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < products.length

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected
                }}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">SKU</TableHead>
            <TableHead className="hidden lg:table-cell">Categoria</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="hidden md:table-cell text-center">Personalizable</TableHead>
            <TableHead className="hidden lg:table-cell text-center">Produccion</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="hidden lg:table-cell">Actualizado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const status = statusConfig[product.status]
            const isSelected = selectedIds.includes(product.id)

            return (
              <TableRow
                key={product.id}
                className={cn(isSelected && 'bg-muted/50')}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectOne(product.id, checked === true)}
                    aria-label={`Seleccionar ${product.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-secondary">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs text-muted-foreground">N/A</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-foreground">
                      {product.name}
                    </span>
                    <span className="font-serif text-xs text-muted-foreground md:hidden">
                      {product.sku}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="font-mono text-sm text-muted-foreground">
                    {product.sku}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="font-sans text-sm">
                    {categoryLabels[product.category]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-sans font-medium">
                    ${product.basePrice.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell text-center">
                  {product.customizable ? (
                    <div className="flex justify-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                        <Palette className="h-3.5 w-3.5 text-success" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  <span className="font-sans text-sm">
                    {product.productionDays} dias
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="font-sans">
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="font-serif text-sm text-muted-foreground">
                    {new Date(product.updatedAt).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
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
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onView(product)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(product)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onArchive(product)}>
                        <Archive className="mr-2 h-4 w-4" />
                        {product.status === 'archivado' ? 'Activar' : 'Archivar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(product)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
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

// Loading Skeleton
export function ProductsTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
            <TableHead className="w-16"><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-12" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
              <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
              <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
              <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
