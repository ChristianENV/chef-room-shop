'use client'

import { customizeEditDesign, routes } from '@/src/config/routes'
import Link from 'next/link'
import {
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Palette,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SavedDesign, SavedDesignStatus } from '@/lib/types'
import { DesignPreviewImage } from './components/design-preview-image'

interface SavedDesignCardProps {
  design: SavedDesign
  onAddToCart?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  isAddingToCart?: boolean
}

export function SavedDesignCard({
  design,
  onAddToCart,
  onDuplicate,
  onDelete,
  isAddingToCart = false,
}: SavedDesignCardProps) {
  const statusConfig: Record<SavedDesignStatus, { label: string; className: string }> = {
    borrador: { label: 'Borrador', className: 'bg-muted text-muted-foreground' },
    'en-carrito': { label: 'En carrito', className: 'bg-primary/10 text-primary' },
    comprado: { label: 'Comprado', className: 'bg-success/10 text-success' },
  }

  const status = statusConfig[design.status]
  const editHref = customizeEditDesign(design.id, design.productSlug)
  const canAddToCart = design.status !== 'comprado'

  return (
    <Card
      className="group border-border bg-card overflow-hidden transition-all hover:border-primary/50"
      data-testid="account-design-card"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <DesignPreviewImage
          previewUrl={design.previewImage}
          fallbackHex={design.customization.color}
          productName={design.productName}
          alt={`Vista previa de ${design.name}`}
          className="absolute inset-0"
        />

        <Badge className={cn('absolute left-3 top-3 z-10 text-xs', status.className)}>
          {status.label}
        </Badge>

        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={editHref}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver diseño
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={editHref}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar diseño
                </Link>
              </DropdownMenuItem>
              {canAddToCart && (
                <DropdownMenuItem onClick={() => onAddToCart?.(design.id)} disabled={isAddingToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al carrito
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate?.(design.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              {design.status === 'borrador' && (
                <DropdownMenuItem
                  onClick={() => onDelete?.(design.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="truncate font-sans font-semibold text-foreground">{design.name}</h3>
          <p className="font-serif text-sm text-muted-foreground">{design.productName}</p>

          <div className="flex flex-wrap gap-1">
            {design.fabricName ? (
              <Badge variant="outline" className="text-xs">
                {design.fabricName}
              </Badge>
            ) : null}
            {design.customization.embroideryText ? (
              <Badge variant="outline" className="text-xs">
                {design.customization.embroideryText}
              </Badge>
            ) : null}
            {design.customization.embroideryType ? (
              <Badge variant="outline" className="text-xs">
                {design.customization.embroideryType}
              </Badge>
            ) : null}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="font-sans text-lg font-bold text-foreground">
              ${design.estimatedPrice.toLocaleString('es-MX')}
            </p>
            <p className="font-serif text-xs text-muted-foreground">
              Actualizado {new Date(design.lastEdited).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={editHref}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={editHref}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          {canAddToCart ? (
            <Button
              size="sm"
              className="w-full sm:w-auto sm:flex-1"
              disabled={isAddingToCart}
              onClick={() => onAddToCart?.(design.id)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

interface SavedDesignsGridProps {
  designs: SavedDesign[]
  isLoading?: boolean
  onAddToCart?: (id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  addingDesignId?: string | null
}

export function SavedDesignsGrid({
  designs,
  isLoading,
  onAddToCart,
  onDuplicate,
  onDelete,
  addingDesignId = null,
}: SavedDesignsGridProps) {
  if (isLoading) {
    return <SavedDesignsSkeleton />
  }

  if (designs.length === 0) {
    return <SavedDesignsEmptyState />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <SavedDesignCard
          key={design.id}
          design={design}
          onAddToCart={onAddToCart}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          isAddingToCart={addingDesignId === design.id}
        />
      ))}
    </div>
  )
}

function SavedDesignsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden border-border bg-card">
          <div className="aspect-square animate-pulse bg-secondary" />
          <CardContent className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-3/4 rounded bg-secondary" />
              <div className="h-4 w-1/2 rounded bg-secondary" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded bg-secondary" />
                <div className="h-5 w-16 rounded bg-secondary" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-6 w-20 rounded bg-secondary" />
                <div className="h-4 w-24 rounded bg-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SavedDesignsEmptyState() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-secondary p-4">
          <Palette className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-sans text-lg font-semibold text-foreground">
          No tienes diseños guardados
        </h3>
        <p className="mt-1 max-w-sm font-serif text-muted-foreground">
          Crea tu primer diseño personalizado y guárdalo aquí para usarlo cuando quieras.
        </p>
        <Button className="mt-6" asChild>
          <Link href={routes.customize}>
            <Palette className="mr-2 h-4 w-4" />
            Crear diseño
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
