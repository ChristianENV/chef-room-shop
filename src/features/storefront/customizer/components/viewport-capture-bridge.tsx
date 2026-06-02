'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useThree } from '@react-three/fiber'
import type { Camera, Scene, WebGLRenderer } from 'three'
import type { ViewAngle } from '../types/customizer.types'
import { useCustomizerStore } from '../store/customizer.store'
import {
  DESIGN_PREVIEW_MAX_DIMENSION,
  DESIGN_PREVIEW_WEBP_QUALITY,
  captureWebGLCanvasAsWebp,
} from '../lib/canvas-capture'

export type DesignPreviewBlobs = {
  front: Blob
  back: Blob
}

export type ViewportCaptureHandle = {
  captureDesignPreviews: () => Promise<DesignPreviewBlobs | null>
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
  angle: ViewAngle,
  setViewAngle: (angle: ViewAngle) => void,
  setCaptureInstant: (value: boolean) => void,
): Promise<Blob> {
  setCaptureInstant(true)
  setViewAngle(angle)
  await waitAnimationFrames(4)
  gl.render(scene, camera)
  await waitAnimationFrames(1)
  return captureWebGLCanvasAsWebp(
    gl.domElement,
    DESIGN_PREVIEW_MAX_DIMENSION,
    DESIGN_PREVIEW_WEBP_QUALITY,
  )
}

/**
 * R3F child that exposes canvas capture for front/back design previews.
 * Must live inside `<Canvas>`.
 */
export const ViewportCaptureBridge = forwardRef<ViewportCaptureHandle>(
  function ViewportCaptureBridge(_, ref) {
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
              'front',
              setViewAngle,
              setCaptureInstant,
            )
            const back = await captureAngle(
              gl,
              scene,
              camera,
              'back',
              setViewAngle,
              setCaptureInstant,
            )
            return { front, back }
          } finally {
            setCaptureInstant(false)
            setViewAngle(previousAngle)
          }
        },
      }),
      [gl, scene, camera, setViewAngle, setCaptureInstant],
    )

    return null
  },
)
