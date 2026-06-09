'use client'

import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { logCustomizer3d } from './customizer-3d-debug'
import { resetCameraToModel, type ModelBounds, type OrbitControlsLike } from './fit-model-to-viewport'

export type ModelReadyPayload = {
  modelUrl: string
  bounds: ModelBounds
}

type ModelCameraRigProps = {
  modelReady: ModelReadyPayload | null
}

/**
 * Resets camera + OrbitControls once per modelUrl after the garment reports
 * valid bounds. Avoids relying on 2D/3D remount to fix camera state.
 */
export function ModelCameraRig({ modelReady }: ModelCameraRigProps) {
  const { camera, controls, invalidate } = useThree()
  const appliedForModelRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!modelReady?.bounds.valid) return
    if (appliedForModelRef.current === modelReady.modelUrl) return
    if (!controls || !(camera instanceof THREE.PerspectiveCamera)) {
      logCustomizer3d('camera-reset-skipped', {
        modelUrl: modelReady.modelUrl,
        reason: 'controls-or-camera-unavailable',
      })
      return
    }

    resetCameraToModel(camera, controls as unknown as OrbitControlsLike, modelReady.bounds)
    appliedForModelRef.current = modelReady.modelUrl
    invalidate()
  }, [camera, controls, invalidate, modelReady])

  return null
}
