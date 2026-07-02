'use client'

import dynamic from 'next/dynamic'
import type { RefObject } from 'react'
import { useCustomizerStore } from '../store/customizer.store'
import { resolveViewportRenderer } from '../lib/customizer-viewport'
import { Svg2DRenderer } from './svg-2d-renderer'
import type { ViewportCaptureHandle } from './viewport-3d'

// The 3D renderer pulls in Three.js / R3F and must stay client-only.
const Viewport3D = dynamic(() => import('./viewport-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12]">
      <div className="text-muted-foreground">Cargando visor 3D...</div>
    </div>
  ),
})

interface CustomizerViewportHostProps {
  viewportCaptureRef?: RefObject<ViewportCaptureHandle | null>
}

/**
 * Chooses the active viewport renderer based on the current `viewMode`:
 * - `2D` → {@link Svg2DRenderer} (SVG garment preview)
 * - `3D` → existing {@link Viewport3D} (Three.js), unchanged
 *
 * The 3D capture ref is forwarded only to the 3D renderer, preserving the
 * existing preview / add-to-cart capture behavior (which still requires 3D).
 */
export function CustomizerViewportHost({ viewportCaptureRef }: CustomizerViewportHostProps) {
  const viewMode = useCustomizerStore((state) => state.viewMode)
  const renderer = resolveViewportRenderer(viewMode)

  if (renderer === '2d') {
    return <Svg2DRenderer />
  }

  return <Viewport3D ref={viewportCaptureRef} />
}
