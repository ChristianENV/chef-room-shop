'use client'

import { useLayoutEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { logCustomizer3d } from './customizer-3d-debug'
import {
  isBoundsReadyForFit,
  resetCameraToModel,
  type ModelBounds,
  type OrbitControlsLike,
} from './fit-model-to-viewport'

export type ModelReadyPayload = {
  modelUrl: string
  bounds: ModelBounds
  fitKey: string
  registryKey: string
}

type ModelCameraRigProps = {
  modelReady: ModelReadyPayload | null
}

/**
 * Resets camera + OrbitControls once per `fitKey` after the garment reports
 * valid bounds. Camera fit never modifies model scale.
 */
export function ModelCameraRig({ modelReady }: ModelCameraRigProps) {
  const { camera, controls, invalidate, size } = useThree()
  const appliedFitKeyRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!modelReady?.bounds.valid) return
    if (appliedFitKeyRef.current === modelReady.fitKey) return
    if (!controls || !(camera instanceof THREE.PerspectiveCamera)) {
      logCustomizer3d('camera-reset-skipped', {
        fitKey: modelReady.fitKey,
        modelUrl: modelReady.modelUrl,
        reason: 'controls-or-camera-unavailable',
      })
      return
    }

    const containerSize = { width: size.width, height: size.height }
    if (!isBoundsReadyForFit(modelReady.bounds, containerSize)) {
      logCustomizer3d('camera-reset-skipped', {
        fitKey: modelReady.fitKey,
        modelUrl: modelReady.modelUrl,
        reason: 'waiting-for-valid-bounds-or-container',
        containerSize,
        boundsSize: modelReady.bounds.size.toArray(),
      })
      return
    }

    const applied = resetCameraToModel(
      camera,
      controls as unknown as OrbitControlsLike,
      modelReady.bounds,
      containerSize,
    )

    if (applied) {
      appliedFitKeyRef.current = modelReady.fitKey
      invalidate()
    }
  }, [camera, controls, invalidate, modelReady, size.height, size.width])

  return null
}
