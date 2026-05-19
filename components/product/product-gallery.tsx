'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import type { ProductImage, ProductBadgeType } from '@/lib/types'

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
  className 
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front')

  const currentImage = images[selectedIndex]

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
        {/* Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <svg className="h-24 w-24 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">{currentImage?.alt || productName}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {badges?.customizable && (
            <Badge className="bg-primary text-primary-foreground">
              Personalizable
            </Badge>
          )}
          {badges?.popular && (
            <Badge className="bg-accent text-accent-foreground">
              Mas vendido
            </Badge>
          )}
          {badges?.productionDays && (
            <Badge variant="secondary" className="bg-card text-foreground">
              Produccion {badges.productionDays} dias
            </Badge>
          )}
        </div>

        {/* Zoom Button */}
        <button 
          className="absolute right-4 top-4 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
          aria-label="Ampliar imagen"
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2 text-foreground transition-colors hover:bg-card"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* View Toggle */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-card/90 p-1">
          <button
            onClick={() => setViewMode('front')}
            className={cn(
              'rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors',
              viewMode === 'front' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Vista frontal
          </button>
          <button
            onClick={() => setViewMode('back')}
            className={cn(
              'rounded-full px-3 py-1 font-sans text-xs font-medium transition-colors',
              viewMode === 'back' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Vista trasera
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary transition-all',
                selectedIndex === index 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                  : 'opacity-60 hover:opacity-100'
              )}
              aria-label={`Ver ${image.alt}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-8 w-8 opacity-30 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
