'use client'

import { useLayoutEffect, type RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

type GarmentBoundsHelperProps = {
  rootRef: RefObject<THREE.Object3D | null>
  color?: number
}

/** Dev overlay: wireframe box around the garment root (matches smoke scene). */
export function GarmentBoundsHelper({
  rootRef,
  color = 0x00ff88,
}: GarmentBoundsHelperProps) {
  const { scene } = useThree()

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    root.updateWorldMatrix(true, true)
    const helper = new THREE.BoxHelper(root, color)
    scene.add(helper)

    return () => {
      scene.remove(helper)
      helper.geometry.dispose()
      const material = helper.material
      if (!Array.isArray(material)) material.dispose()
    }
  }, [color, rootRef, scene])

  return null
}
