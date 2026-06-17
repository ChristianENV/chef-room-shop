'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { Hero3DCalibrationPanel } from './hero-3d-calibration-panel'
import {
  checkHero3DModelAssetsAvailable,
  createInitialHero3DDebugState,
  hero3dLog,
  isLandingHero3dCalibrateEnabled,
  type Hero3DDebugState,
  type Hero3DRenderMode,
} from './hero-3d-debug'
import {
  cloneComposition,
  HERO_3D_STAGE,
  HERO_JACKET_COMPOSITION,
  type HeroJacketComposition,
} from './hero-3d-config'
import { Hero3DDebugOverlay } from './hero-3d-debug-overlay'
import { HeroStaticVisual } from './hero-static-visual'
import type { Hero3DSceneReport } from './hero-3d-scene'

const Hero3DSceneCanvas = dynamic(
  () => import('./hero-3d-scene').then((mod) => mod.Hero3DSceneCanvas),
  { ssr: false, loading: () => null },
)

const MODEL_LOAD_TIMEOUT_MS = 12_000

type Hero3DShowcaseProps = {
  className?: string
  priority?: boolean
}

function detectWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}

function detectMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 639px)').matches
}

function detectDeviceDpr(): number {
  if (typeof window === 'undefined') return 1.25
  return window.devicePixelRatio > 1.5 ? 1.5 : 1.25
}

function usePrefersMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(detectMobileViewport)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return isMobile
}

function resolveTimeoutMessage(debug: Hero3DDebugState): string {
  if (debug.hero3dReady) return 'Camera fit failed'
  if (debug.assetLoadState === 'loaded' && debug.meshCount > 0) return 'Camera fit failed'
  if (debug.modelPreparedState === 'prepared') return 'Camera fit failed'
  return 'Model load timeout (12s)'
}

function mergeSceneReport(
  previous: Hero3DDebugState,
  report: Hero3DSceneReport,
): Hero3DDebugState {
  return {
    ...previous,
    assetLoadState: report.assetLoadState,
    modelPreparedState: report.modelPreparedState,
    boundsFitState: report.boundsFitState,
    hero3dReady: report.hero3dReady || previous.hero3dReady,
    modelLoadState: report.modelLoadState,
    meshCount: report.meshCount,
    boundsSize: report.boundsSize ?? previous.boundsSize,
    boundsCenter: report.boundsCenter ?? previous.boundsCenter,
    radius: report.radius ?? previous.radius,
    cameraPosition: report.cameraPosition ?? previous.cameraPosition,
    fittedCameraDistance: report.fittedCameraDistance ?? previous.fittedCameraDistance,
    paddingRatio: report.paddingRatio ?? previous.paddingRatio,
    fitCalculationCount: report.fitCalculationCount ?? previous.fitCalculationCount,
    cameraUpdateCount: report.cameraUpdateCount ?? previous.cameraUpdateCount,
    modelCloneCount: report.modelCloneCount ?? previous.modelCloneCount,
    errorMessage: report.errorMessage ?? previous.errorMessage,
    lastError: report.lastError ?? previous.lastError,
    visibleMeshCount: report.visibleMeshCount ?? previous.visibleMeshCount,
    materialNames: report.materialNames ?? previous.materialNames,
    materialOpacities: report.materialOpacities ?? previous.materialOpacities,
    materialTransparentFlags:
      report.materialTransparentFlags ?? previous.materialTransparentFlags,
    boundsMin: report.boundsMin ?? previous.boundsMin,
    boundsMax: report.boundsMax ?? previous.boundsMax,
    cameraTarget: report.cameraTarget ?? previous.cameraTarget,
  }
}

/**
 * Premium landing hero 3D jacket showcase with static fallback.
 * Isolated from the customizer — read-only visual, no editing state.
 */
export function Hero3DShowcase({ className, priority }: Hero3DShowcaseProps) {
  const reduceMotion = useReducedMotion()
  const isMobile = usePrefersMobileViewport()
  const webglAvailable = detectWebGLAvailable()
  const dpr = detectDeviceDpr()
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedLayerRef = useRef<HTMLDivElement>(null)
  const hero3dReadyRef = useRef(false)
  const calibrateEnabled = isLandingHero3dCalibrateEnabled()

  const [composition, setComposition] = useState<HeroJacketComposition>(() =>
    cloneComposition(HERO_JACKET_COMPOSITION),
  )
  const [debug, setDebug] = useState<Hero3DDebugState>(createInitialHero3DDebugState)
  const [assetsAvailable, setAssetsAvailable] = useState<boolean | null>(null)
  const [assetsChecked, setAssetsChecked] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [canvasMounted, setCanvasMounted] = useState(false)

  const activeComposition = calibrateEnabled ? composition : HERO_JACKET_COMPOSITION

  useEffect(() => {
    let cancelled = false
    void checkHero3DModelAssetsAvailable().then((available) => {
      if (cancelled) return
      setAssetsAvailable(available)
      setAssetsChecked(true)
      setDebug((prev) => ({ ...prev, assetsAvailable: available }))
      hero3dLog(`asset HEAD checks: ${available ? 'ok' : 'failed'}`)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      setDebug((prev) => ({
        ...prev,
        canvasSize: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      }))
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const fallbackReason = useMemo(() => {
    if (isMobile) return 'mobile-viewport'
    if (!webglAvailable) return 'webgl-unavailable'
    if (assetsChecked && assetsAvailable === false) return 'model-assets-missing'
    if (sceneFailed) {
      if (debug.timeoutTriggered) return 'model-timeout'
      return debug.errorMessage ?? 'scene-error'
    }
    return null
  }, [
    isMobile,
    webglAvailable,
    assetsChecked,
    assetsAvailable,
    sceneFailed,
    debug.timeoutTriggered,
    debug.errorMessage,
  ])

  useEffect(() => {
    if (fallbackReason) {
      hero3dLog(`fallback reason: ${fallbackReason}`)
    }
  }, [fallbackReason])

  const useStaticVisual = Boolean(fallbackReason)
  const renderMode: Hero3DRenderMode = useStaticVisual ? 'static-fallback' : '3d'
  const showCanvas = !useStaticVisual && canvasMounted && sceneReady

  useEffect(() => {
    if (useStaticVisual || sceneReady || !canvasMounted) return

    const timeout = window.setTimeout(() => {
      if (hero3dReadyRef.current) {
        setDebug((prev) => ({
          ...prev,
          boundsFitState: prev.boundsFitState === 'fitting' ? 'fallback' : prev.boundsFitState,
          lastError: prev.lastError ?? 'Camera fit failed',
        }))
        hero3dLog('camera fit failed (timeout waiting for bounds fit)')
        return
      }

      setSceneFailed(true)
      setDebug((prev) => {
        const message = resolveTimeoutMessage(prev)
        return {
          ...prev,
          timeoutTriggered: true,
          modelLoadState: prev.hero3dReady ? prev.modelLoadState : 'error',
          errorMessage: prev.errorMessage ?? message,
          lastError: prev.lastError ?? message,
        }
      })
    }, MODEL_LOAD_TIMEOUT_MS)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [useStaticVisual, sceneReady, canvasMounted])

  const handleSceneError = useCallback((message: string) => {
    hero3dLog(`scene error: ${message}`)
    setSceneFailed(true)
    setDebug((prev) => ({
      ...prev,
      modelLoadState: 'error',
      assetLoadState: 'error',
      errorMessage: message,
      lastError: message,
    }))
  }, [])

  const handleSceneReport = useCallback((report: Hero3DSceneReport) => {
    setDebug((prev) => mergeSceneReport(prev, report))

    if (report.hero3dReady) {
      hero3dReadyRef.current = true
      setSceneReady((prev) => prev || true)
    }

    if (report.modelPreparedState === 'error' || report.assetLoadState === 'error') {
      setSceneFailed(true)
    }
  }, [])

  const handleCanvasMounted = useCallback(() => {
    setCanvasMounted(true)
    setDebug((prev) => ({
      ...prev,
      canvasMounted: true,
      assetLoadState: prev.assetLoadState === 'idle' ? 'loading' : prev.assetLoadState,
      modelLoadState: prev.modelLoadState === 'idle' ? 'loading' : prev.modelLoadState,
    }))
  }, [])

  const handleModelRotationY = useCallback((rotationY: number) => {
    const node = loadedLayerRef.current
    if (!node) return
    node.dataset.heroRotationY = rotationY.toFixed(4)
  }, [])

  const animate = !reduceMotion && !useStaticVisual

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-visible',
        HERO_3D_STAGE.minHeightClass,
        HERO_3D_STAGE.smMinHeightClass,
        HERO_3D_STAGE.lgMinHeightClass,
        className,
      )}
      data-testid="landing-hero-3d-showcase"
    >
      <div
        className={cn('absolute inset-0 z-0', showCanvas ? 'opacity-0' : 'opacity-100')}
        data-testid={
          useStaticVisual ? 'landing-hero-3d-fallback' : 'landing-hero-3d-static-backdrop'
        }
      >
        <HeroStaticVisual priority={priority} />
      </div>

      {!useStaticVisual ? (
        <div
          ref={loadedLayerRef}
          className={cn(
            'absolute inset-0 z-10',
            HERO_3D_STAGE.minHeightClass,
            HERO_3D_STAGE.smMinHeightClass,
            HERO_3D_STAGE.lgMinHeightClass,
            showCanvas ? 'opacity-100' : 'opacity-0',
          )}
          data-testid={showCanvas ? 'landing-hero-3d-loaded' : undefined}
        >
          <Hero3DSceneCanvas
            animate={animate}
            composition={activeComposition}
            dpr={dpr}
            onError={handleSceneError}
            onReport={handleSceneReport}
            onModelRotationY={handleModelRotationY}
            onMounted={handleCanvasMounted}
            className="h-full w-full cursor-grab active:cursor-grabbing"
          />
        </div>
      ) : null}

      <Hero3DCalibrationPanel composition={composition} onChange={setComposition} />

      <Hero3DDebugOverlay
        debug={{
          ...debug,
          renderMode,
          canvasMounted,
          fallbackReason,
        }}
      />

      {sceneFailed && debug.errorMessage ? (
        <div data-testid="landing-hero-3d-error" className="sr-only" aria-live="polite">
          {debug.errorMessage}
        </div>
      ) : null}
    </div>
  )
}
