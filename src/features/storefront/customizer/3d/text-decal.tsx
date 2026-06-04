'use client'

import { useMemo } from 'react'
import { Decal } from '@react-three/drei'
import * as THREE from 'three'
import type { ZoneDefinition } from './customizer-zones'

export type TextDecalProps = {
  text: string
  fontSize: number
  textColor: string
  fontFamily: string
  opacity: number
  zone: ZoneDefinition
  /** Target mesh the Decal is projected onto. */
  mesh: THREE.Mesh
}

const CANVAS_WIDTH = 512
const CANVAS_HEIGHT = 128

function buildTextTexture(
  text: string,
  fontSize: number,
  textColor: string,
  fontFamily: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const clampedSize = Math.max(16, Math.min(fontSize * 3, 96))
  ctx.font = `bold ${clampedSize}px ${fontFamily}, sans-serif`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text || ' ', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function TextDecal({ text, fontSize, textColor, fontFamily, opacity, zone, mesh }: TextDecalProps) {
  const texture = useMemo(
    () => buildTextTexture(text, fontSize, textColor, fontFamily),
    [text, fontSize, textColor, fontFamily],
  )

  // Drei's Decal requires a RefObject<Mesh>. We wrap the already-resolved mesh.
  const meshRef = useMemo<React.RefObject<THREE.Mesh>>(() => ({ current: mesh }), [mesh])

  return (
    <Decal
      mesh={meshRef}
      position={zone.position}
      rotation={zone.rotation}
      scale={zone.scale}
    >
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
