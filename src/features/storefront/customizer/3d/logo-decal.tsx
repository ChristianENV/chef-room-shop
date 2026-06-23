'use client'

import { useMemo } from 'react'
import { Decal, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'
import type { ZoneDefinition } from './customizer-zones'

export type LogoDecalProps = {
  assetUrl: string
  opacity: number
  /** Layer rotation in degrees; added to the zone's base rotation on Z axis. */
  rotation: number
  zone: ZoneDefinition
  /** Target mesh the Decal is projected onto. */
  mesh: THREE.Mesh
}

function LogoDecalInner({ assetUrl, opacity, rotation, zone, mesh }: LogoDecalProps) {
  const textureUrl = toSameOriginR2Url(assetUrl) ?? assetUrl
  const texture = useTexture(textureUrl)

  const euler = useMemo(
    () =>
      new THREE.Euler(
        zone.rotation.x,
        zone.rotation.y,
        zone.rotation.z + (rotation * Math.PI) / 180,
      ),
    [zone, rotation],
  )

  // Drei's Decal requires a RefObject<Mesh>. We wrap the already-resolved mesh.
  const meshRef = useMemo<React.RefObject<THREE.Mesh>>(() => ({ current: mesh }), [mesh])

  return (
    <Decal mesh={meshRef} position={zone.position} rotation={euler} scale={zone.scale}>
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity / 100}
        polygonOffset
        polygonOffsetFactor={-10}
        depthTest
      />
    </Decal>
  )
}

/**
 * Renders a logo image as a projected Decal on a 3D mesh.
 * Wrapped in Suspense by the parent (GarmentModelInner) because
 * `useTexture` suspends until the image loads.
 */
export function LogoDecal(props: LogoDecalProps) {
  return <LogoDecalInner {...props} />
}
