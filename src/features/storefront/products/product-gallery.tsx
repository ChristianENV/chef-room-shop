'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ProductImageDisplay, ProductImageThumbnail } from '@/components/shared/product-image'
import { getProductMainImageUrl, getVisibleProductImages } from '@/src/lib/product/product-images'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import type { ProductImage } from '@/lib/types'
import { ProductLightbox } from './product-lightbox'

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

export function ProductGallery({ images, productName, badges, className }: ProductGalleryProps) {
  const visibleImages = useMemo(() => getVisibleProductImages(images), [images])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

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

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className={cn('flex flex-col gap-3', className)}>
        {/* Main Image */}
        <div
          className="relative aspect-square overflow-hidden rounded-xl bg-muted"
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
              <Badge className="bg-accent text-accent-foreground">Más vendido</Badge>
            )}
            {badges?.productionDays && (
              <Badge variant="secondary" className="bg-card text-foreground">
                Producción {badges.productionDays} días
              </Badge>
            )}
          </div>

          {/* Zoom Button — opens real lightbox */}
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
            aria-label="Ver imagen"
            data-testid="product-gallery-zoom"
            onClick={() => openLightbox(safeIndex)}
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
                data-testid="product-gallery-prev"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
                aria-label="Imagen siguiente"
                data-testid="product-gallery-next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image count indicator */}
          {visibleImages.length > 1 && (
            <span className="absolute bottom-3 right-4 z-10 rounded-full bg-card/90 px-2 py-0.5 font-mono text-[11px] text-foreground/70">
              {safeIndex + 1} / {visibleImages.length}
            </span>
          )}
        </div>

        {/* Thumbnails — flex-wrap prevents overflow on mobile */}
        {visibleImages.length > 1 && (
          <div
            className="flex flex-wrap gap-2"
            data-testid="product-gallery-thumbnails"
            role="list"
            aria-label="Fotografías del producto"
          >
            {visibleImages.map((image, index) => (
              <div key={image.id} role="listitem">
                <ProductImageThumbnail
                  image={image}
                  selected={safeIndex === index}
                  onClick={() => setSelectedIndex(index)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && visibleImages.length > 0 && (
        <ProductLightbox
          images={visibleImages}
          initialIndex={lightboxIndex}
          productName={productName}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </>
  )
}
