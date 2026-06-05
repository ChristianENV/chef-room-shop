'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  ProductImageDisplay,
  ProductImageThumbnail,
} from '@/components/shared/product-image'
import {
  getProductMainImageUrl,
  getVisibleProductImages,
} from '@/src/lib/product/product-images'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import type { ProductImage } from '@/lib/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
  badges?: {
    customizable?: boolean
    popular?: boolean
    productionDays?: number
  }
  className?: string
}

export function ProductGallery({
  images,
  productName,
  badges,
  className,
}: ProductGalleryProps) {
  const visibleImages = useMemo(() => getVisibleProductImages(images), [images])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front')

  const safeIndex = visibleImages.length > 0 ? selectedIndex % visibleImages.length : 0
  const currentImage = visibleImages[safeIndex]

  const goToPrevious = () => {
    if (visibleImages.length <= 1) return
    setSelectedIndex((prev) => (prev === 0 ? visibleImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    if (visibleImages.length <= 1) return
    setSelectedIndex((prev) => (prev === visibleImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main Image */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-[#0d1024]"
        data-testid="product-gallery-main"
      >
        <ProductImageDisplay
          src={currentImage ? getProductMainImageUrl(currentImage) : null}
          alt={currentImage?.alt || productName}
          className="absolute inset-0"
          imgClassName="object-contain object-center"
          placeholderIconClassName="h-24 w-24"
        />

        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
          {badges?.customizable && (
            <Badge className="bg-primary text-primary-foreground">Personalizable</Badge>
          )}
          {badges?.popular && (
            <Badge className="bg-accent text-accent-foreground">Mas vendido</Badge>
          )}
          {badges?.productionDays && (
            <Badge variant="secondary" className="bg-card text-foreground">
              Produccion {badges.productionDays} dias
            </Badge>
          )}
        </div>

        {/* Zoom Button */}
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
          aria-label="Ampliar imagen"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Navigation Arrows */}
        {visibleImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* View Toggle */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-card/90 p-1">
          <button
            type="button"
            onClick={() => setViewMode('front')}
            className={cn(
              'rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors',
              viewMode === 'front'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Vista frontal
          </button>
          <button
            type="button"
            onClick={() => setViewMode('back')}
            className={cn(
              'rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors',
              viewMode === 'back'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Vista trasera
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {visibleImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {visibleImages.map((image, index) => (
            <ProductImageThumbnail
              key={image.id}
              image={image}
              selected={safeIndex === index}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
