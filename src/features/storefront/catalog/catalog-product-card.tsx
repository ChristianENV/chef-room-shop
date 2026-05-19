'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, Heart, Eye, Clock, Sparkles } from 'lucide-react'
import type { Product, ProductBadgeType } from '@/lib/types'

// Enhanced Product Card for Catalog
interface CatalogProductCardProps {
  product: Product
  onView?: () => void
  onCustomize?: () => void
  onQuickView?: () => void
  className?: string
}

export function CatalogProductCard({
  product,
  onView,
  onCustomize,
  onQuickView,
  className,
}: CatalogProductCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-xl',
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {/* Product Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground transition-transform duration-500 group-hover:scale-110">
          <svg
            className="h-20 w-20 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.badge && <CatalogBadge type={product.badge} />}
          {product.customizable && (
            <Badge
              variant="outline"
              className="border-primary/50 bg-card/90 font-sans text-xs text-primary backdrop-blur-sm"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Personalizable
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className="absolute right-3 top-3 rounded-full bg-card/90 p-2 opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-card hover:scale-110 group-hover:opacity-100"
          aria-label="Agregar a favoritos"
        >
          <Heart className="h-4 w-4 text-foreground" />
        </button>

        {/* Quick View Button */}
        <button
          onClick={onQuickView}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-4 rounded-full bg-card/90 px-4 py-2 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-card group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span className="flex items-center gap-2 font-sans text-xs font-medium text-foreground">
            <Eye className="h-4 w-4" />
            Vista rapida
          </span>
        </button>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Category */}
        <p className="font-serif text-xs uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="mt-1 line-clamp-2 font-sans text-base font-medium text-foreground">
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="mt-1 line-clamp-1 font-serif text-sm text-muted-foreground">
          {product.shortDescription}
        </p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span className="font-serif text-sm text-foreground">{product.rating}</span>
          <span className="font-serif text-sm text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-sans text-lg font-bold text-foreground">
            ${product.price.toLocaleString('es-MX')}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="font-serif text-sm text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString('es-MX')}
              </span>
              <span className="font-sans text-xs font-medium text-success">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Color Options */}
        {product.colors.length > 1 && (
          <div className="mt-3 flex items-center gap-1.5">
            {product.colors.slice(0, 5).map((color) => (
              <div
                key={color.id}
                className="h-5 w-5 rounded-full border border-border shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="font-serif text-xs text-muted-foreground">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Production Time */}
        <div className="mt-3 flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-serif text-xs">3-5 dias</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 font-sans text-xs"
            onClick={onView}
          >
            Ver producto
          </Button>
          {product.customizable && (
            <Button
              size="sm"
              className="flex-1 gap-1 font-sans text-xs"
              onClick={onCustomize}
            >
              <Sparkles className="h-3 w-3" />
              Personalizar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Badge Component
interface CatalogBadgeProps {
  type: ProductBadgeType
}

const badgeStyles: Record<ProductBadgeType, string> = {
  nuevo: 'bg-success text-white',
  oferta: 'bg-destructive text-white',
  agotado: 'bg-muted text-muted-foreground',
  personalizable: 'bg-primary text-primary-foreground',
  popular: 'bg-primary text-primary-foreground',
}

function CatalogBadge({ type }: CatalogBadgeProps) {
  const labels: Record<ProductBadgeType, string> = {
    nuevo: 'Nuevo',
    oferta: 'Oferta',
    agotado: 'Agotado',
    personalizable: 'Personalizable',
    popular: 'Popular',
  }

  return (
    <Badge className={cn('font-sans text-xs uppercase tracking-wider', badgeStyles[type])}>
      {labels[type]}
    </Badge>
  )
}

// Product Grid Skeleton
interface CatalogSkeletonProps {
  count?: number
}

export function CatalogSkeleton({ count = 8 }: CatalogSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-5 w-3/4" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-20" />
            <Skeleton className="mt-3 h-6 w-24" />
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-5 rounded-full" />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
