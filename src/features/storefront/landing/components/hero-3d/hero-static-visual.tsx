'use client'

import { LandingMediaImage } from '../landing-media-image'
import { LANDING_MEDIA } from '../../lib/landing-media'

type HeroStaticVisualProps = {
  priority?: boolean
  className?: string
}

/** Static hero garment visual — used as fallback when 3D is unavailable. */
export function HeroStaticVisual({ priority, className }: HeroStaticVisualProps) {
  return (
    <LandingMediaImage
      asset={LANDING_MEDIA.hero}
      priority={priority}
      fit="contain"
      sizes="(max-width: 1024px) min(95vw, 500px), min(58vw, 640px)"
      overlay="none"
      frameClassName="bg-transparent"
      className={className ?? 'absolute inset-0 !aspect-auto'}
      imageClassName="!p-0"
    />
  )
}
