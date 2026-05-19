'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CartPreviewCategory } from '@/src/types/cart'
import { CART_CATEGORY_LABELS } from '@/src/features/storefront/cart/lib/cart-utils'

type CartProductThumbnailProps = {
  productName: string
  category: CartPreviewCategory
  imageUrl?: string
  colorHex?: string
  className?: string
}

function getProductInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Product thumbnail with premium fallback when the image is missing or fails to load.
 */
export function CartProductThumbnail({
  productName,
  category,
  imageUrl,
  colorHex,
  className,
}: CartProductThumbnailProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(imageUrl) && !imageFailed

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-muted',
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={productName}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-1 p-2"
          style={{
            background: colorHex
              ? `linear-gradient(145deg, ${colorHex}22 0%, var(--secondary) 55%, var(--muted) 100%)`
              : undefined,
          }}
        >
          <span className="font-sans text-lg font-bold tracking-tight text-foreground/80">
            {getProductInitials(productName)}
          </span>
          <span className="font-sans text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            {CART_CATEGORY_LABELS[category]}
          </span>
          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
        </div>
      )}
    </div>
  )
}
