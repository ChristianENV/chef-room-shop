'use client'

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useCustomizerStore } from '../store/customizer.store'
import type { Layer, SleeveStyle } from '../types/customizer.types'
import type { CustomizerModelDefinition } from './model-registry'
import { inspectGltf } from './inspect-gltf'
import {
  applyColorToMaterial,
  resolveTintableMaterialGroups,
} from './material-resolver'
import { CUSTOMIZER_ZONES, findZoneMesh, resolveZoneId } from './customizer-zones'
import { TextDecal } from './text-decal'
import { LogoDecal } from './logo-decal'

export type GarmentModelProps = {
  modelConfig: CustomizerModelDefinition
  baseColor: string
  detailColor: string
  sleeveStyle: SleeveStyle
  layers: Layer[]
  onModelReady?: () => void
  onModelError?: (error: Error) => void
}

function GarmentModelInner({
  modelConfig,
  baseColor,
  detailColor,
  layers,
  onModelReady,
}: GarmentModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(modelConfig.modelUrl)

  // Clone the scene graph once (materials are shared until the resolver clones
  // the ones we tint). Avoids mutating the cached GLTF across instances.
  const model = useMemo(() => scene.clone(true), [scene])

  // Resolve + clone-once tintable materials (preserving PBR maps). The returned
  // materials are mutated in place on color changes — never re-cloned per render.
  const tintGroups = useMemo(() => {
    const groups = resolveTintableMaterialGroups(model, {
      body: modelConfig.materialHints.body,
      detail: modelConfig.materialHints.detail,
      buttons: modelConfig.materialHints.buttons,
      bodyMesh: modelConfig.meshHints.body,
    })
    if (groups.body.length === 0 && process.env.NODE_ENV !== 'production') {
      console.warn(
        `[customizer-3d] No body materials matched for "${modelConfig.id}". ` +
          'Adjust materialHints/meshHints in model-registry.ts (enable NEXT_PUBLIC_CUSTOMIZER_DEBUG_3D=true to inspect).',
      )
    }
    return groups
  }, [model, modelConfig])

  useEffect(() => {
    inspectGltf(modelConfig.id, model)
    onModelReady?.()
  }, [model, modelConfig.id, onModelReady])

  // baseColor -> body materials.
  useEffect(() => {
    tintGroups.body.forEach((material) => applyColorToMaterial(material, baseColor))
  }, [tintGroups, baseColor])

  // detailColor -> detail + buttons materials (no dedicated buttonColor in store).
  // If there are no detail/button materials, this is a no-op (won't break).
  useEffect(() => {
    tintGroups.detail.forEach((material) => applyColorToMaterial(material, detailColor))
    tintGroups.buttons.forEach((material) => applyColorToMaterial(material, detailColor))
  }, [tintGroups, detailColor])

  // Rotate to front/back, matching the procedural fallback so capture works.
  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const { viewAngle, captureInstant } = useCustomizerStore.getState()
    const target = viewAngle === 'back' ? Math.PI : 0
    if (captureInstant) {
      group.rotation.y = target
      return
    }
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target, 0.06)
  })

  const visibleDecalLayers = layers.filter((layer: Layer) =>
    layer.visible &&
    (layer.type === 'text' || layer.type === 'logo') &&
    (layer.type === 'logo' ? Boolean(layer.assetUrl) : Boolean(layer.text?.trim())),
  )

  return (
    <group
      ref={groupRef}
      position={modelConfig.position}
      rotation={modelConfig.rotation}
      scale={modelConfig.scale}
    >
      <primitive object={model} />

      {visibleDecalLayers.map((layer: Layer) => {
        const zoneId = resolveZoneId(layer.zone)
        const zone = CUSTOMIZER_ZONES[zoneId]
        const mesh = findZoneMesh(model, zone.targetMeshHints)

        if (!mesh) return null

        if (layer.type === 'text') {
          return (
            <TextDecal
              key={layer.id}
              text={layer.text ?? ''}
              fontSize={layer.fontSize ?? 18}
              textColor={layer.textColor ?? '#ffffff'}
              fontFamily={layer.fontFamily ?? 'sans-serif'}
              opacity={layer.opacity}
              zone={zone}
              mesh={mesh}
            />
          )
        }

        if (layer.type === 'logo' && layer.assetUrl) {
          return (
            <Suspense key={layer.id} fallback={null}>
              <LogoDecal
                assetUrl={layer.assetUrl}
                opacity={layer.opacity}
                rotation={layer.rotation}
                zone={zone}
                mesh={mesh}
              />
            </Suspense>
          )
        }

        return null
      })}
    </group>
  )
}

type GarmentModelErrorBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
  onError?: (error: Error) => void
}

type GarmentModelErrorBoundaryState = { hasError: boolean }

/** Catches GLB load/parse errors and renders the procedural fallback instead. */
class GarmentModelErrorBoundary extends Component<
  GarmentModelErrorBoundaryProps,
  GarmentModelErrorBoundaryState
> {
  state: GarmentModelErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): GarmentModelErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export type GarmentModelLoaderProps = GarmentModelProps & {
  /**
   * Shown inside the <Canvas> while the GLB is downloading (Suspense fallback).
   * Use a lightweight R3F-compatible element (e.g. an <Html> spinner).
   */
  suspenseFallback?: ReactNode
  /**
   * Rendered when the GLB fails to load or parse (error boundary fallback).
   * Should be the procedural model so the viewport never breaks.
   */
  errorFallback: ReactNode
}

/**
 * Renders the GLB garment with Suspense + error boundary.
 * - While downloading: shows `suspenseFallback` (spinner).
 * - On load/parse error: shows `errorFallback` (procedural model).
 */
export function GarmentModelLoader({
  suspenseFallback,
  errorFallback,
  ...props
}: GarmentModelLoaderProps) {
  return (
    <GarmentModelErrorBoundary fallback={errorFallback} onError={props.onModelError}>
      <Suspense fallback={suspenseFallback ?? errorFallback}>
        <GarmentModelInner {...props} />
      </Suspense>
    </GarmentModelErrorBoundary>
  )
}
