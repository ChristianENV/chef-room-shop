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
      className="pointer-events-none absolute bottom-2 left-2 z-50 max-w-[min(100%,360px)] rounded-md border border-white/20 bg-black/80 p-2 font-mono text-[10px] leading-relaxed text-emerald-200 shadow-lg"
      data-testid="landing-hero-3d-debug"
    >
      <p>renderMode: {debug.renderMode}</p>
      <p>hero3dReady: {String(debug.hero3dReady)}</p>
      <p>assetLoadState: {debug.assetLoadState}</p>
      <p>modelPreparedState: {debug.modelPreparedState}</p>
      <p>boundsFitState: {debug.boundsFitState}</p>
      <p>canvasMounted: {String(debug.canvasMounted)}</p>
      <p>
        canvasSize: {debug.canvasSize.width} × {debug.canvasSize.height}
      </p>
      <p>modelUrl: {debug.modelUrl}</p>
      <p>modelLoadState: {debug.modelLoadState}</p>
      <p>meshCount: {debug.meshCount}</p>
      <p>visibleMeshCount: {debug.visibleMeshCount}</p>
      <p>boundsSize: {boundsLabel}</p>
      <p>
        boundsMin:{' '}
        {debug.boundsMin ? debug.boundsMin.map((v) => v.toFixed(2)).join(', ') : '—'}
      </p>
      <p>
        boundsMax:{' '}
        {debug.boundsMax ? debug.boundsMax.map((v) => v.toFixed(2)).join(', ') : '—'}
      </p>
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
      <p>
        cameraTarget:{' '}
        {debug.cameraTarget ? debug.cameraTarget.map((v) => v.toFixed(2)).join(', ') : '—'}
      </p>
      <p>
        fittedDistance:{' '}
        {debug.fittedCameraDistance != null ? debug.fittedCameraDistance.toFixed(2) : '—'}
      </p>
      <p>
        paddingRatio: {debug.paddingRatio != null ? debug.paddingRatio.toFixed(2) : '—'}
      </p>
      <p>materialNames: {debug.materialNames.length ? debug.materialNames.join(', ') : '—'}</p>
      <p>
        materialOpacity:{' '}
        {debug.materialOpacities.length ? debug.materialOpacities.join(', ') : '—'}
      </p>
      <p>
        materialTransparent:{' '}
        {debug.materialTransparentFlags.length
          ? debug.materialTransparentFlags.map(String).join(', ')
          : '—'}
      </p>
      <p>fitCalculations: {debug.fitCalculationCount ?? '—'}</p>
      <p>cameraUpdates: {debug.cameraUpdateCount ?? '—'}</p>
      <p>modelClones: {debug.modelCloneCount ?? '—'}</p>
      <p>assetsAvailable: {debug.assetsAvailable == null ? '—' : String(debug.assetsAvailable)}</p>
      <p>timeoutTriggered: {String(debug.timeoutTriggered)}</p>
      {debug.fallbackReason ? <p>fallbackReason: {debug.fallbackReason}</p> : null}
      {debug.lastError ? <p className="text-amber-200">lastError: {debug.lastError}</p> : null}
      {debug.errorMessage ? (
        <p className="text-red-300" data-testid="landing-hero-3d-error">
          error: {debug.errorMessage}
        </p>
      ) : null}
    </div>
  )
}
