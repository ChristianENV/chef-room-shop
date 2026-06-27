'use client'

import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ProductImage } from '@/lib/types'
import { getProductMainImageUrl } from '@/src/lib/product/product-images'

interface ProductLightboxProps {
  images: ProductImage[]
  initialIndex: number
  productName: string
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ProductLightbox({
  images,
  initialIndex,
  productName,
  onClose,
  onNavigate,
}: ProductLightboxProps) {
  const current = images[initialIndex]

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'ArrowLeft' && images.length > 1) {
        onNavigate(initialIndex === 0 ? images.length - 1 : initialIndex - 1)
      }
      if (event.key === 'ArrowRight' && images.length > 1) {
        onNavigate(initialIndex === images.length - 1 ? 0 : initialIndex + 1)
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [images.length, initialIndex, onClose, onNavigate])

  // Prevent body scroll while open
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const goToPrevious = () => {
    onNavigate(initialIndex === 0 ? images.length - 1 : initialIndex - 1)
  }

  const goToNext = () => {
    onNavigate(initialIndex === images.length - 1 ? 0 : initialIndex + 1)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Ver imagen"
      data-testid="product-lightbox"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex h-full max-h-[100dvh] w-full max-w-5xl flex-col px-2 py-4 sm:px-4 sm:py-6">
        {/* Top bar */}
        <div className="mb-2 flex shrink-0 items-center justify-between px-2">
          <p className="truncate font-sans text-sm font-medium text-white/80">
            {current?.alt || productName}
          </p>
          <div className="flex items-center gap-3">
            {images.length > 1 && (
              <span className="font-mono text-xs text-white/50">
                {initialIndex + 1} / {images.length}
              </span>
            )}
            <button
              type="button"
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              onClick={onClose}
              aria-label="Cerrar"
              data-testid="product-lightbox-close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main image */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center">
          {images.length > 1 && (
            <button
              type="button"
              className="absolute left-0 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:p-3"
              onClick={goToPrevious}
              aria-label="Imagen anterior"
              data-testid="product-lightbox-prev"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.id}
              src={getProductMainImageUrl(current) ?? ''}
              alt={current.alt || productName}
              className="max-h-full max-w-full select-none object-contain"
              draggable={false}
              data-testid="product-lightbox-image"
            />
          ) : null}

          {images.length > 1 && (
            <button
              type="button"
              className="absolute right-0 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:p-3"
              onClick={goToNext}
              aria-label="Imagen siguiente"
              data-testid="product-lightbox-next"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="mt-3 flex shrink-0 justify-center gap-2 overflow-x-auto px-2 pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onNavigate(index)}
                aria-label={image.alt || `Imagen ${index + 1}`}
                aria-current={index === initialIndex ? 'true' : undefined}
                className={cn(
                  'h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all',
                  index === initialIndex
                    ? 'border-white opacity-100'
                    : 'border-white/20 opacity-60 hover:border-white/50 hover:opacity-90',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getProductMainImageUrl(image) ?? ''}
                  alt={image.alt || `Imagen ${index + 1}`}
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
