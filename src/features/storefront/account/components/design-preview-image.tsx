'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

type DesignPreviewImageProps = {
  previewUrl?: string | null
  fallbackHex?: string | null
  productName?: string
  alt: string
  className?: string
  testId?: string
}

function getProductInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

/** Design preview with graceful fallback when previewUrl is missing or fails to load. */
export function DesignPreviewImage({
  previewUrl,
  fallbackHex,
  productName,
  alt,
  className,
  testId = 'account-design-preview',
}: DesignPreviewImageProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showFallback = !previewUrl || imageFailed

  if (showFallback) {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 p-3',
          className,
        )}
        style={{
          background: fallbackHex
            ? `linear-gradient(145deg, ${fallbackHex}33 0%, var(--secondary) 50%, var(--muted) 100%)`
            : undefined,
        }}
        data-testid={testId}
        aria-label={alt}
      >
        {productName ? (
          <span className="font-sans text-lg font-bold tracking-tight text-foreground/80">
            {getProductInitials(productName)}
          </span>
        ) : null}
        <Palette className="size-8 text-muted-foreground/70" aria-hidden />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={previewUrl}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      data-testid={testId}
      onError={() => setImageFailed(true)}
    />
  )
}
