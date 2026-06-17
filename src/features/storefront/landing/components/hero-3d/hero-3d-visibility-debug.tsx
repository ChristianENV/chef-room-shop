'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

import type { HeroFramingFitResult } from './hero-3d-framing'

type HeroVisibilityDebugProps = {
  enabled: boolean
  fitResult: HeroFramingFitResult | null
  modelBounds: {
    min: THREE.Vector3
    max: THREE.Vector3
    center: THREE.Vector3
    size: THREE.Vector3
  } | null
}

export function HeroVisibilityDebug({
  enabled,
  fitResult,
  modelBounds,
}: HeroVisibilityDebugProps) {
  const target = useMemo(() => {
    if (fitResult) return fitResult.target
    return new THREE.Vector3(0, 1, 0)
  }, [fitResult])

  if (!enabled) return null

  return (
    <group name="hero-visibility-debug">
      <mesh position={[target.x, target.y, target.z]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#ff00ff" />
      </mesh>

      {modelBounds ? (
        <group name="hero-model-bounds-debug">
          <mesh position={[modelBounds.center.x, modelBounds.center.y, modelBounds.center.z]}>
            <boxGeometry args={[modelBounds.size.x, modelBounds.size.y, modelBounds.size.z]} />
            <meshBasicMaterial color="#44ff88" wireframe transparent opacity={0.9} />
          </mesh>
          <mesh position={[modelBounds.center.x, modelBounds.min.y, modelBounds.center.z]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#22ff66" />
          </mesh>
          <mesh position={[modelBounds.center.x, modelBounds.max.y, modelBounds.center.z]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#ff4466" />
          </mesh>
          <mesh position={[modelBounds.center.x, modelBounds.center.y, modelBounds.center.z]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#ffcc22" />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}
