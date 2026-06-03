'use client'

import { forwardRef, useImperativeHandle, type RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import type { Camera, Scene, WebGLRenderer } from 'three'
import type { ViewAngle } from '../types/customizer.types'
import { useCustomizerStore } from '../store/customizer.store'
import {
  captureCompositeViewportAsWebp,
  DESIGN_PREVIEW_MAX_DIMENSION,
  DESIGN_PREVIEW_WEBP_QUALITY,
  captureWebGLCanvasAsWebp,
} from '../lib/canvas-capture'

export type DesignPreviewBlobs = {
  front: Blob
  back: Blob
  warning?: string | null
}

export type ViewportCaptureHandle = {
  captureDesignPreviews: () => Promise<DesignPreviewBlobs | null>
}

type ViewportCaptureBridgeProps = {
  viewportRootRef?: RefObject<HTMLDivElement | null>
}

function waitAnimationFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    let remaining = count
    const step = () => {
      remaining -= 1
      if (remaining <= 0) resolve()
      else requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

async function captureAngle(
  gl: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  viewportRoot: HTMLElement | null,
  angle: ViewAngle,
  setViewAngle: (angle: ViewAngle) => void,
  setCaptureInstant: (value: boolean) => void,
): Promise<{ blob: Blob; usedFallback: boolean; fallbackReason?: 'cors' | 'generic' }> {
  setCaptureInstant(true)
  setViewAngle(angle)
  await waitAnimationFrames(4)
  gl.render(scene, camera)
  await waitAnimationFrames(1)

  if (viewportRoot) {
    try {
      const blob = await captureCompositeViewportAsWebp(
        viewportRoot,
        DESIGN_PREVIEW_MAX_DIMENSION,
        DESIGN_PREVIEW_WEBP_QUALITY,
      )
      return { blob, usedFallback: false }
    } catch (error) {
      const message =
        error instanceof Error ? error.message.toLowerCase() : 'composite capture failed'
      const corsIssue =
        message.includes('tainted') ||
        message.includes('cors') ||
        message.includes('cross-origin')
      const fallbackBlob = await captureWebGLCanvasAsWebp(
        gl.domElement,
        DESIGN_PREVIEW_MAX_DIMENSION,
        DESIGN_PREVIEW_WEBP_QUALITY,
      )
      return {
        blob: fallbackBlob,
        usedFallback: true,
        fallbackReason: corsIssue ? 'cors' : 'generic',
      }
    }
  }

  const fallbackBlob = await captureWebGLCanvasAsWebp(
    gl.domElement,
    DESIGN_PREVIEW_MAX_DIMENSION,
    DESIGN_PREVIEW_WEBP_QUALITY,
  )
  return { blob: fallbackBlob, usedFallback: true }
}

/**
 * R3F child that exposes canvas capture for front/back design previews.
 * Must live inside `<Canvas>`.
 */
export const ViewportCaptureBridge = forwardRef<ViewportCaptureHandle, ViewportCaptureBridgeProps>(
  function ViewportCaptureBridge({ viewportRootRef }, ref) {
    const { gl, scene, camera } = useThree()
    const setViewAngle = useCustomizerStore((state) => state.setViewAngle)
    const setCaptureInstant = useCustomizerStore((state) => state.setCaptureInstant)

    useImperativeHandle(
      ref,
      () => ({
        async captureDesignPreviews() {
          const previousAngle = useCustomizerStore.getState().viewAngle

          try {
            const front = await captureAngle(
              gl,
              scene,
              camera,
              viewportRootRef?.current ?? null,
              'front',
              setViewAngle,
              setCaptureInstant,
            )
            const back = await captureAngle(
              gl,
              scene,
              camera,
              viewportRootRef?.current ?? null,
              'back',
              setViewAngle,
              setCaptureInstant,
            )

            const warning =
              front.fallbackReason === 'cors' || back.fallbackReason === 'cors'
                ? 'No pudimos incluir algunos elementos por CORS de imágenes (R2). Guardamos la prenda, pero texto/logotipos podrían faltar en la vista previa.'
                : front.usedFallback || back.usedFallback
                  ? 'Guardamos la prenda, pero algunos elementos visuales podrían no aparecer en la vista previa.'
                  : null

            return { front: front.blob, back: back.blob, warning }
          } finally {
            setCaptureInstant(false)
            setViewAngle(previousAngle)
          }
        },
      }),
      [gl, scene, camera, setViewAngle, setCaptureInstant, viewportRootRef],
    )

    return null
  },
)
