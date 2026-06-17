import * as THREE from 'three'

export type HeroFitMode = 'contain-height' | 'contain'

export type HeroFramingOptions = {
  paddingRatio: number
  fitMode: HeroFitMode
  verticalBias: number
  rotationFitPadding: number
  targetTorsoRatio: number
  preserveAspect: boolean
  idleRotationAmplitude: number
  dragRotationLimit: number
}

export type HeroBoundsSnapshot = {
  box: THREE.Box3
  size: THREE.Vector3
  center: THREE.Vector3
  min: THREE.Vector3
  max: THREE.Vector3
}

export type HeroFramingFitResult = {
  distance: number
  target: THREE.Vector3
  position: THREE.Vector3
  bounds: HeroBoundsSnapshot
}

export function computeObjectBounds(object: THREE.Object3D): HeroBoundsSnapshot {
  object.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(object)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  const min = box.min.clone()
  const max = box.max.clone()
  box.getSize(size)
  box.getCenter(center)
  return { box, size, center, min, max }
}

function expandSizeForRotation(
  size: THREE.Vector3,
  yawEnvelope: number,
  rotationFitPadding: number,
): THREE.Vector3 {
  const horizontalScale = 1 + yawEnvelope * 0.42 + rotationFitPadding
  return new THREE.Vector3(size.x * horizontalScale, size.y, size.z * horizontalScale)
}

/**
 * Fit a posed object inside a perspective camera viewport with padding.
 * Uses bounds center for targeting — never the GLTF origin.
 */
export function fitObjectToPerspectiveCamera(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  viewDirection: THREE.Vector3,
  options: HeroFramingOptions,
): HeroFramingFitResult {
  const bounds = computeObjectBounds(object)
  const yawEnvelope = options.idleRotationAmplitude + options.dragRotationLimit
  const fitSize = expandSizeForRotation(bounds.size, yawEnvelope, options.rotationFitPadding)

  const usableHeightRatio = 1 - options.paddingRatio
  const usableWidthRatio = 1 - options.paddingRatio

  const vFov = THREE.MathUtils.degToRad(camera.fov)
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)

  const fitHeightDistance = fitSize.y / usableHeightRatio / (2 * Math.tan(vFov / 2))
  const fitWidthDistance = fitSize.x / usableWidthRatio / (2 * Math.tan(hFov / 2))

  const distance =
    options.fitMode === 'contain-height'
      ? fitHeightDistance
      : Math.max(fitHeightDistance, fitWidthDistance)

  const target = new THREE.Vector3(
    bounds.center.x,
    bounds.min.y + bounds.size.y * options.targetTorsoRatio + options.verticalBias * bounds.size.y,
    bounds.center.z,
  )

  const viewDir = viewDirection.clone().normalize()
  const position = target.clone().add(viewDir.multiplyScalar(distance))

  return { distance, target, position, bounds }
}
