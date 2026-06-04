'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import type { LandingMediaAsset } from '../lib/landing-media'

type LandingMediaImageProps = {
  asset: LandingMediaAsset
  className?: string
  imageClassName?: string
  priority?: boolean
  sizes?: string
  overlay?: 'none' | 'soft' | 'dramatic' | 'category'
  fit?: 'cover' | 'contain'
  frameClassName?: string
}

export function LandingMediaImage({
  asset,
  className,
  imageClassName,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  overlay = 'soft',
  fit = 'cover',
  frameClassName,
}: LandingMediaImageProps) {
  const [failed, setFailed] = useState(false)
  const hasSrc = Boolean(asset.src?.trim()) && !failed

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-secondary',
        asset.aspectClass,
        frameClassName,
        className,
      )}
      data-landing-slot={asset.slot}
    >
      {hasSrc ? (
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            fit === 'contain' ? 'object-contain object-center' : 'object-cover object-center',
            imageClassName,
          )}
          onError={() => setFailed(true)}
        />
      ) : (
        <LandingMediaPlaceholder label={asset.label ?? asset.slot} />
      )}

      {overlay !== 'none' && hasSrc ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            overlay === 'soft' &&
              'bg-gradient-to-t from-background/40 via-transparent to-transparent',
            overlay === 'dramatic' &&
              'bg-gradient-to-tr from-primary/30 via-transparent to-transparent',
            overlay === 'category' &&
              'bg-gradient-to-t from-[#0c0f24]/95 via-[#0c0f24]/25 to-transparent',
          )}
          aria-hidden
        />
      ) : null}
    </div>
  )
}

export function LandingMediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/8 via-secondary to-accent">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, var(--primary) 0%, transparent 45%), radial-gradient(circle at 80% 70%, var(--primary) 0%, transparent 40%)',
        }}
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
        <div className="h-px w-12 bg-primary/40" aria-hidden />
        <p className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-primary/70">
          Asset pendiente
        </p>
        <p className="font-serif text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
