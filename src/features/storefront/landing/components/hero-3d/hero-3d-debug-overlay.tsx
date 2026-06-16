'use client'

import type { Hero3DDebugState } from './hero-3d-debug'
import { isLandingHero3dDebugEnabled } from './hero-3d-debug'

type Hero3DDebugOverlayProps = {
  debug: Hero3DDebugState
}

export function Hero3DDebugOverlay({ debug }: Hero3DDebugOverlayProps) {
  if (!isLandingHero3dDebugEnabled()) return null

  const boundsLabel = debug.boundsSize
    ? `${debug.boundsSize.map((v) => v.toFixed(2)).join(' × ')}`
    : '—'

  return (
    <div
      className="pointer-events-none absolute bottom-2 left-2 z-50 max-w-[min(100%,320px)] rounded-md border border-white/20 bg-black/80 p-2 font-mono text-[10px] leading-relaxed text-emerald-200 shadow-lg"
      data-testid="landing-hero-3d-debug"
    >
      <p>renderMode: {debug.renderMode}</p>
      <p>canvasMounted: {String(debug.canvasMounted)}</p>
      <p>
        canvasSize: {debug.canvasSize.width} × {debug.canvasSize.height}
      </p>
      <p>modelUrl: {debug.modelUrl}</p>
      <p>modelLoadState: {debug.modelLoadState}</p>
      <p>meshCount: {debug.meshCount}</p>
      <p>boundsSize: {boundsLabel}</p>
      <p>
        boundsCenter:{' '}
        {debug.boundsCenter
          ? debug.boundsCenter.map((v) => v.toFixed(2)).join(', ')
          : '—'}
      </p>
      <p>radius: {debug.radius != null ? debug.radius.toFixed(2) : '—'}</p>
      <p>
        cameraPosition:{' '}
        {debug.cameraPosition
          ? debug.cameraPosition.map((v) => v.toFixed(2)).join(', ')
          : '—'}
      </p>
      <p>assetsAvailable: {debug.assetsAvailable == null ? '—' : String(debug.assetsAvailable)}</p>
      {debug.fallbackReason ? <p>fallbackReason: {debug.fallbackReason}</p> : null}
      {debug.errorMessage ? (
        <p className="text-red-300" data-testid="landing-hero-3d-error">
          error: {debug.errorMessage}
        </p>
      ) : null}
    </div>
  )
}
