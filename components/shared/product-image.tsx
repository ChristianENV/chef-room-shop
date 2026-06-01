'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  getPrimaryProductImageUrl,
  getVisibleProductImages,
} from '@/src/lib/product/product-images'
import type { ProductImage as ProductImageType } from '@/lib/types'

export type ProductImageDisplayProps = {
  /** Full image list — primary URL is resolved automatically. */
  images?: ProductImageType[] | null
  /** Explicit URL override (e.g. single thumbnail). */
  src?: string | null
  alt: string
  className?: string
  imgClassName?: string
  /** Icon size for the empty-state placeholder. */
  placeholderIconClassName?: string
  /** When true, image fills a relative parent (absolute inset-0). */
  fill?: boolean
}

/**
 * Renders a product photo from catalog/admin data with a consistent fallback.
 */
export function ProductImageDisplay({
  images,
  src,
  alt,
  className,
  imgClassName,
  placeholderIconClassName = 'h-16 w-16',
  fill = true,
}: ProductImageDisplayProps) {
  const resolvedSrc = (src?.trim() || getPrimaryProductImageUrl(images)) ?? null
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(resolvedSrc) && !failed

  if (!showImage) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-secondary text-muted-foreground',
          className,
        )}
      >
        <svg
          className={cn('opacity-30', placeholderIconClassName)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn(fill && 'relative', 'overflow-hidden bg-secondary', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={resolvedSrc}
        src={resolvedSrc!}
        alt={alt}
        className={cn(
          fill ? 'absolute inset-0 h-full w-full object-cover' : 'h-full w-full object-cover',
          imgClassName,
        )}
        onError={() => setFailed(true)}
      />
    </div>
  )
}

export type ProductImageThumbnailProps = {
  image: ProductImageType
  selected?: boolean
  className?: string
  onClick?: () => void
}

/** Small thumbnail for product galleries. */
export function ProductImageThumbnail({
  image,
  selected = false,
  className,
  onClick,
}: ProductImageThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary transition-all',
        selected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'opacity-60 hover:opacity-100',
        className,
      )}
      aria-label={`Ver ${image.alt || 'imagen'}`}
    >
      <ProductImageDisplay
        src={image.url}
        alt={image.alt || 'Miniatura'}
        fill
        placeholderIconClassName="h-8 w-8"
      />
    </button>
  )
}

export { getVisibleProductImages }
