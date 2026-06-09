'use client'

import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useCustomizerStore } from '../store/customizer.store'
import type { Layer, SleeveStyle } from '../types/customizer.types'
import type { CustomizerModelDefinition } from './model-registry'
import { CUSTOMIZER_TRANSFORM_VERSION } from './model-registry'
import { inspectGltf } from './inspect-gltf'
import {
  applyColorToMaterial,
  resolveTintableMaterialGroups,
} from './material-resolver'
import { CUSTOMIZER_ZONES, findZoneMesh, resolveZoneId } from './customizer-zones'
import { TextDecal } from './text-decal'
import { LogoDecal } from './logo-decal'
import { logCustomizer3d } from './customizer-3d-debug'
import {
  buildModelFitKey,
  getBoundsRadius,
  getSafeModelBounds,
  isBoundsReadyForFit,
  logModelFit,
} from './fit-model-to-viewport'
import type { ModelReadyPayload } from './model-camera-rig'

export type { ModelBounds } from './fit-model-to-viewport'

export type GarmentModelProps = {
  modelConfig: CustomizerModelDefinition
  baseColor: string
  detailColor: string
  sleeveStyle: SleeveStyle
  layers: Layer[]
  productSlug?: string | null
  onModelReady?: (payload: ModelReadyPayload) => void
  onModelError?: (error: Error) => void
}

function GarmentModelInner({
  modelConfig,
  baseColor,
  detailColor,
  layers,
  productSlug,
  onModelReady,
}: GarmentModelProps) {
  const rotationRef = useRef<THREE.Group>(null)
  const modelRootRef = useRef<THREE.Group>(null)
  const onModelReadyRef = useRef(onModelReady)
  const notifiedFitKeyRef = useRef<string | null>(null)

  useEffect(() => {
    onModelReadyRef.current = onModelReady
  }, [onModelReady])

  const fitKey = useMemo(
    () =>
      buildModelFitKey({
        registryKey: modelConfig.registryKey,
        modelUrl: modelConfig.modelUrl,
        transformVersion: CUSTOMIZER_TRANSFORM_VERSION,
        productSlug,
      }),
    [modelConfig.registryKey, modelConfig.modelUrl, productSlug],
  )

  const appliedTransform = useMemo(
    () => ({
      scale: modelConfig.scale,
      position: modelConfig.position,
      rotation: modelConfig.rotation,
    }),
    [modelConfig.position, modelConfig.rotation, modelConfig.scale],
  )

  const { scene } = useGLTF(modelConfig.modelUrl)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        object.material = materials.map((material) => material.clone())
      }
    })
    return clone
  }, [scene])

  const tintGroups = useMemo(() => {
    const groups = resolveTintableMaterialGroups(clonedScene, {
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
  }, [clonedScene, modelConfig])

  useLayoutEffect(() => {
    const root = modelRootRef.current
    if (!root) return
    if (notifiedFitKeyRef.current === fitKey) return

    root.updateWorldMatrix(true, true)
    const worldBounds = getSafeModelBounds(root)

    if (!isBoundsReadyForFit(worldBounds)) {
      logCustomizer3d('model-fit-skipped', {
        modelUrl: modelConfig.modelUrl,
        productSlug,
        registryKey: modelConfig.registryKey,
        fitKey,
        reason: 'invalid-bounds',
        bounds: worldBounds.size.toArray(),
        center: worldBounds.center.toArray(),
        radius: getBoundsRadius(worldBounds),
        appliedTransform,
      })
      return
    }

    notifiedFitKeyRef.current = fitKey

    logModelFit(
      modelConfig.modelUrl,
      worldBounds,
      {
        scale: appliedTransform.scale,
        position: new THREE.Vector3(...appliedTransform.position),
        rotation: new THREE.Euler(...appliedTransform.rotation),
      },
      'registry',
      {
        registryKey: modelConfig.registryKey,
        productSlug,
        fitKey,
      },
    )
    inspectGltf(modelConfig.id, clonedScene)
    onModelReadyRef.current?.({
      modelUrl: modelConfig.modelUrl,
      bounds: worldBounds,
      fitKey,
      registryKey: modelConfig.registryKey,
    })
  }, [
    appliedTransform,
    clonedScene,
    fitKey,
    modelConfig.id,
    modelConfig.modelUrl,
    modelConfig.registryKey,
    productSlug,
  ])

  useEffect(() => {
    tintGroups.body.forEach((material) => applyColorToMaterial(material, baseColor))
  }, [tintGroups, baseColor])

  useEffect(() => {
    tintGroups.detail.forEach((material) => applyColorToMaterial(material, detailColor))
    tintGroups.buttons.forEach((material) => applyColorToMaterial(material, detailColor))
  }, [tintGroups, detailColor])

  useFrame(() => {
    const group = rotationRef.current
    if (!group) return
    const { viewAngle, captureInstant } = useCustomizerStore.getState()
    const target = viewAngle === 'back' ? Math.PI : 0
    if (captureInstant) {
      group.rotation.y = target
      return
    }
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target, 0.06)
  })

  const visibleDecalLayers = layers.filter(
    (layer: Layer) =>
      layer.visible &&
      (layer.type === 'text' || layer.type === 'logo') &&
      (layer.type === 'logo' ? Boolean(layer.assetUrl) : Boolean(layer.text?.trim())),
  )

  return (
    <group ref={rotationRef}>
      <group
        ref={modelRootRef}
        scale={appliedTransform.scale}
        position={appliedTransform.position}
        rotation={appliedTransform.rotation}
      >
        <primitive object={clonedScene} />

        {visibleDecalLayers.map((layer: Layer) => {
          const zoneId = resolveZoneId(layer.zone)
          const zone = CUSTOMIZER_ZONES[zoneId]
          const mesh = findZoneMesh(clonedScene, zone.targetMeshHints)

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
    logCustomizer3d('model-load-error', {
      message: error.message,
      name: error.name,
    })
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export type GarmentModelLoaderProps = GarmentModelProps & {
  suspenseFallback?: ReactNode
  errorFallback: ReactNode
}

export function GarmentModelLoader({
  suspenseFallback,
  errorFallback,
  modelConfig,
  ...props
}: GarmentModelLoaderProps) {
  useEffect(() => {
    useGLTF.preload(modelConfig.modelUrl)
  }, [modelConfig.modelUrl])

  return (
    <GarmentModelErrorBoundary fallback={errorFallback} onError={props.onModelError}>
      <Suspense fallback={suspenseFallback ?? errorFallback}>
        <GarmentModelInner modelConfig={modelConfig} {...props} />
      </Suspense>
    </GarmentModelErrorBoundary>
  )
}
