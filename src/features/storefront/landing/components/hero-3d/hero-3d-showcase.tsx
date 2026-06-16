'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { Hero3DCalibrationPanel } from './hero-3d-calibration-panel'
import {
  checkHero3DModelAssetsAvailable,
  createInitialHero3DDebugState,
  isLandingHero3dCalibrateEnabled,
  isLandingHero3dDebugEnabled,
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
  const calibrateEnabled = isLandingHero3dCalibrateEnabled()

  const [composition, setComposition] = useState<HeroJacketComposition>(() =>
    cloneComposition(HERO_JACKET_COMPOSITION),
  )
  const [debug, setDebug] = useState<Hero3DDebugState>(createInitialHero3DDebugState)
  const [assetsAvailable, setAssetsAvailable] = useState<boolean | null>(null)
  const [assetsChecked, setAssetsChecked] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [canvasMounted, setCanvasMounted] = useState(false)

  const activeComposition = calibrateEnabled ? composition : HERO_JACKET_COMPOSITION

  useEffect(() => {
    let cancelled = false
    void checkHero3DModelAssetsAvailable().then((available) => {
      if (cancelled) return
      setAssetsAvailable(available)
      setAssetsChecked(true)
      setDebug((prev) => ({ ...prev, assetsAvailable: available }))
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
    if (sceneFailed) return debug.errorMessage ?? 'scene-error-or-timeout'
    return null
  }, [
    isMobile,
    webglAvailable,
    assetsChecked,
    assetsAvailable,
    sceneFailed,
    debug.errorMessage,
  ])

  const useStaticVisual = Boolean(fallbackReason)
  const renderMode: Hero3DRenderMode = useStaticVisual ? 'static-fallback' : '3d'
  const showCanvas = !useStaticVisual && canvasMounted && sceneLoaded && debug.meshCount > 0

  useEffect(() => {
    if (useStaticVisual || sceneLoaded) return
    const timer = window.setTimeout(() => {
      setSceneFailed(true)
      setDebug((prev) => ({
        ...prev,
        modelLoadState: 'error',
        errorMessage: prev.errorMessage ?? 'Model load timeout (12s)',
      }))
    }, 12_000)
    return () => window.clearTimeout(timer)
  }, [useStaticVisual, sceneLoaded])

  const handleSceneError = useCallback((message: string) => {
    setSceneFailed(true)
    setDebug((prev) => ({
      ...prev,
      modelLoadState: 'error',
      errorMessage: message,
    }))
  }, [])

  const handleSceneReport = useCallback((report: Hero3DSceneReport) => {
    setDebug((prev) => ({
      ...prev,
      modelLoadState: report.modelLoadState,
      meshCount: report.meshCount,
      boundsSize: report.boundsSize,
      boundsCenter: report.boundsCenter,
      radius: report.radius,
      cameraPosition: report.cameraPosition ?? prev.cameraPosition,
      errorMessage: report.errorMessage ?? prev.errorMessage,
    }))

    if (report.modelLoadState === 'loaded' && report.meshCount > 0) {
      setSceneLoaded(true)
    }

    if (report.modelLoadState === 'error') {
      setSceneFailed(true)
    }
  }, [])

  const handleCameraPosition = useCallback((position: [number, number, number]) => {
    setDebug((prev) => ({ ...prev, cameraPosition: position }))
  }, [])

  const handleCanvasMounted = useCallback(() => {
    setCanvasMounted(true)
    setDebug((prev) => ({
      ...prev,
      canvasMounted: true,
      modelLoadState: prev.modelLoadState === 'idle' ? 'loading' : prev.modelLoadState,
    }))
  }, [])

  const animate = !reduceMotion && !useStaticVisual
  const showDebugPrimitive = isLandingHero3dDebugEnabled()

  const glowStyle = {
    transform: `translate(${activeComposition.glowOffsetX}px, ${activeComposition.glowOffsetY}px)`,
  }

  const pedestalStyle = {
    transform: `translateY(${activeComposition.pedestalOffsetY}px)`,
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full',
        HERO_3D_STAGE.minHeightClass,
        HERO_3D_STAGE.smMinHeightClass,
        HERO_3D_STAGE.lgMinHeightClass,
        className,
      )}
      data-testid="landing-hero-3d-showcase"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_75%_at_50%_38%,rgba(90,111,221,0.32)_0%,transparent_70%)]"
        style={glowStyle}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[14%] top-[16%] h-[40%] rounded-full bg-primary/20 blur-3xl"
        style={glowStyle}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[10%] bottom-[6%] h-[26%] rounded-full bg-[#2B3280]/25 blur-2xl"
        style={pedestalStyle}
        aria-hidden
      />

      <div
        className={cn('absolute inset-0 z-0', showCanvas ? 'opacity-0' : 'opacity-100')}
        data-testid={useStaticVisual ? 'landing-hero-3d-fallback' : undefined}
      >
        <HeroStaticVisual priority={priority} />
      </div>

      {!useStaticVisual ? (
        <div
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
            showDebugPrimitive={showDebugPrimitive}
            onError={handleSceneError}
            onReport={handleSceneReport}
            onCameraPosition={handleCameraPosition}
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
