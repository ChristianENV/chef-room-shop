import * as THREE from 'three'
import type { CustomizerModelDefinition } from './model-registry'
import { logCustomizer3d } from './customizer-3d-debug'

const MIN_SCALE = 0.001
const MAX_SCALE = 10
const DEFAULT_TARGET_HEIGHT = 1.5

export type ModelBounds = {
  valid: boolean
  size: THREE.Vector3
  center: THREE.Vector3
  box: THREE.Box3
}

export type ModelFitTransform = {
  scale: number
  position: THREE.Vector3
  rotation: THREE.Euler
}

export type CalculateModelFitOptions = {
  targetHeight?: number
  minScale?: number
  maxScale?: number
  registryTransform?: Pick<CustomizerModelDefinition, 'scale' | 'position' | 'rotation'>
}

let fitAppliedCount = 0

export function getFitAppliedCount(): number {
  return fitAppliedCount
}

export function getSafeModelBounds(object: THREE.Object3D): ModelBounds {
  object.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(object)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  const valid =
    !box.isEmpty() &&
    Number.isFinite(size.x) &&
    Number.isFinite(size.y) &&
    Number.isFinite(size.z) &&
    size.x > 0 &&
    size.y > 0 &&
    size.z > 0

  return { valid, size, center, box }
}

export function calculateModelFitTransform(
  bounds: ModelBounds,
  options: CalculateModelFitOptions = {},
): ModelFitTransform | null {
  const targetHeight = options.targetHeight ?? DEFAULT_TARGET_HEIGHT
  const minScale = options.minScale ?? MIN_SCALE
  const maxScale = options.maxScale ?? MAX_SCALE

  if (options.registryTransform) {
    const [rx, ry, rz] = options.registryTransform.rotation
    return {
      scale: THREE.MathUtils.clamp(options.registryTransform.scale, minScale, maxScale),
      position: new THREE.Vector3(...options.registryTransform.position),
      rotation: new THREE.Euler(rx, ry, rz),
    }
  }

  if (!bounds.valid) return null

  const maxDimension = Math.max(bounds.size.x, bounds.size.y, bounds.size.z)
  const computedScale = THREE.MathUtils.clamp(targetHeight / maxDimension, minScale, maxScale)
  const position = bounds.center.clone().multiplyScalar(-computedScale)

  return {
    scale: computedScale,
    position,
    rotation: new THREE.Euler(0, 0, 0),
  }
}

/** Applies absolute transform values — never multiplies existing scale. */
export function applyModelFitTransform(
  group: THREE.Group,
  transform: ModelFitTransform,
): void {
  group.rotation.copy(transform.rotation)
  group.position.copy(transform.position)
  group.scale.setScalar(transform.scale)
  group.updateMatrixWorld(true)
  fitAppliedCount += 1
}

export type OrbitControlsLike = {
  target: THREE.Vector3
  minDistance: number
  maxDistance: number
  enabled: boolean
  enableDamping: boolean
  update: () => void
}

export function resetCameraToModel(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControlsLike,
  bounds: ModelBounds,
): void {
  if (!bounds.valid) return

  const target = bounds.center.clone()
  const maxDim = Math.max(bounds.size.x, bounds.size.y, bounds.size.z)
  const distance = THREE.MathUtils.clamp(maxDim * 2.4, 2.4, 6.5)

  controls.target.copy(target)
  camera.position.set(target.x, target.y + maxDim * 0.12, target.z + distance)
  camera.near = Math.max(0.01, distance / 100)
  camera.far = Math.max(50, distance * 20)
  camera.lookAt(target)
  camera.updateProjectionMatrix()

  controls.minDistance = Math.max(0.8, distance * 0.35)
  controls.maxDistance = Math.max(controls.minDistance + 0.5, distance * 2.8)
  controls.enableDamping = true
  controls.enabled = true
  controls.update()

  logCustomizer3d('camera-reset', {
    cameraPosition: camera.position.toArray(),
    controlsTarget: controls.target.toArray(),
    boundsSize: bounds.size.toArray(),
    distance,
    minDistance: controls.minDistance,
    maxDistance: controls.maxDistance,
  })
}

export function logModelFit(
  modelUrl: string,
  bounds: ModelBounds,
  transform: ModelFitTransform,
  source: 'registry' | 'computed',
): void {
  logCustomizer3d('model-fit', {
    modelUrl,
    source,
    boundingBoxSize: bounds.size.toArray(),
    computedScale: transform.scale,
    finalScale: transform.scale,
    position: transform.position.toArray(),
    fitAppliedCount: getFitAppliedCount(),
  })
}
