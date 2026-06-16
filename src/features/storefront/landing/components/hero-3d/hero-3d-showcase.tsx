'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { HeroStaticVisual } from './hero-static-visual'

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
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
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
  const [sceneFailed, setSceneFailed] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const dpr = detectDeviceDpr()

  const handleSceneError = useCallback(() => {
    setSceneFailed(true)
  }, [])

  const handleSceneReady = useCallback(() => {
    setSceneReady(true)
  }, [])

  const useStaticVisual = !webglAvailable || isMobile || sceneFailed

  useEffect(() => {
    if (useStaticVisual || sceneReady) return
    const timer = window.setTimeout(() => {
      setSceneFailed(true)
    }, 12_000)
    return () => window.clearTimeout(timer)
  }, [useStaticVisual, sceneReady])

  const animate = !reduceMotion && !useStaticVisual

  return (
    <div
      className={cn('relative h-full w-full bg-[#0c1024]', className)}
      data-testid="landing-hero-3d-showcase"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_70%_at_52%_42%,rgba(90,111,221,0.38)_0%,transparent_68%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[12%] top-[18%] h-[42%] rounded-full bg-primary/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[8%] bottom-[8%] h-[28%] rounded-full bg-[#2B3280]/30 blur-2xl"
        aria-hidden
      />

      {useStaticVisual ? (
        <div data-testid="landing-hero-static-visual" className="absolute inset-0">
          <HeroStaticVisual priority={priority} />
        </div>
      ) : (
        <>
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              sceneReady ? 'opacity-0' : 'opacity-100',
            )}
            aria-hidden={sceneReady}
          >
            <HeroStaticVisual priority={priority} />
          </div>
          <Hero3DSceneCanvas
            animate={animate}
            dpr={dpr}
            onError={handleSceneError}
            onReady={handleSceneReady}
            className={cn(
              'absolute inset-0 h-full w-full transition-opacity duration-700',
              sceneReady ? 'opacity-100' : 'opacity-0',
            )}
          />
        </>
      )}
    </div>
  )
}
