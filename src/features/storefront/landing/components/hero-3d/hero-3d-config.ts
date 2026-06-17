import { CHEF_JACKET_GLTF_LOCAL } from '@/src/config/public-models'

/** Local chef-jacket glTF — stable same-origin bundle for landing showcase. */
export const HERO_3D_MODEL_URL = CHEF_JACKET_GLTF_LOCAL

/** Fixed stage dimensions — tune composition inside this box, never resize to fit the model. */
export const HERO_3D_STAGE = {
  desktopWidth: 560,
  desktopHeight: 560,
  maxWidthClass: 'max-w-[620px]',
  minHeightClass: 'min-h-[420px]',
  smMinHeightClass: 'sm:min-h-[460px]',
  lgMinHeightClass: 'lg:min-h-[500px]',
} as const

export type HeroIdleRotationMode = 'oscillate' | 'continuous'

export type HeroFitMode = 'contain-height' | 'contain'

/** Bounds-based camera framing — no manual Y guessing. */
export const HERO_JACKET_FRAMING = {
  paddingRatio: 0.2,
  fitMode: 'contain' as HeroFitMode,
  verticalBias: -0.08,
  rotationFitPadding: 0.06,
  targetTorsoRatio: 0.52,
  /** Unit vector from look target toward camera — preserves premium 3/4 view. */
  cameraViewDirection: [0.081, 0.266, 0.959] as [number, number, number],
} as const

/** Safe camera used only when bounds-based fit fails. */
export const HERO_FALLBACK_CAMERA = {
  position: [0.45, 0.85, 5.3] as [number, number, number],
  target: [0, -0.65, 0] as [number, number, number],
  fov: 35,
} as const

export type HeroJacketComposition = {
  modelPosition: [number, number, number]
  modelScale: number
  modelRotationX: number
  modelRotationY: number
  cameraFov: number
  paddingRatio: number
  fitMode: HeroFitMode
  verticalBias: number
  rotationFitPadding: number
  targetTorsoRatio: number
  cameraViewDirection: [number, number, number]
  idleRotationMode: HeroIdleRotationMode
  idleRotationSpeed: number
  idleRotationAmplitude: number
  dragRotationLimit: number
  dragSensitivity: number
  dragReturnSpeed: number
  floatAmplitude: number
  glowOffsetX: number
  glowOffsetY: number
  pedestalOffsetY: number
}

/** Single source of truth for landing hero 3D jacket composition. */
export const HERO_JACKET_COMPOSITION: HeroJacketComposition = {
  modelPosition: [0, 0, 0],
  modelScale: 0.0275,
  modelRotationX: -0.03,
  /** GLTF front faces away at Y=0; π aligns buttons toward the camera. */
  modelRotationY: Math.PI,
  cameraFov: 35,
  paddingRatio: HERO_JACKET_FRAMING.paddingRatio,
  fitMode: HERO_JACKET_FRAMING.fitMode,
  verticalBias: HERO_JACKET_FRAMING.verticalBias,
  rotationFitPadding: HERO_JACKET_FRAMING.rotationFitPadding,
  targetTorsoRatio: HERO_JACKET_FRAMING.targetTorsoRatio,
  cameraViewDirection: [...HERO_JACKET_FRAMING.cameraViewDirection],
  idleRotationMode: 'continuous',
  idleRotationSpeed: 0.45,
  idleRotationAmplitude: 0.12,
  dragRotationLimit: 0.32,
  dragSensitivity: 0.004,
  dragReturnSpeed: 0.08,
  floatAmplitude: 0.035,
  glowOffsetX: 0,
  glowOffsetY: 24,
  pedestalOffsetY: 36,
}

/** JSON shape emitted by the calibration panel "Copy config" action. */
export function compositionToCalibrationJson(composition: HeroJacketComposition) {
  return {
    modelScale: composition.modelScale,
    modelRotationY: composition.modelRotationY,
    paddingRatio: composition.paddingRatio,
    fitMode: composition.fitMode,
    verticalBias: composition.verticalBias,
    cameraFov: composition.cameraFov,
    idleRotationSpeed: composition.idleRotationSpeed,
    idleRotationAmplitude: composition.idleRotationAmplitude,
    rotationFitPadding: composition.rotationFitPadding,
    targetTorsoRatio: composition.targetTorsoRatio,
  }
}

export function cloneComposition(composition: HeroJacketComposition): HeroJacketComposition {
  return {
    ...composition,
    modelPosition: [...composition.modelPosition] as [number, number, number],
    cameraViewDirection: [...composition.cameraViewDirection] as [number, number, number],
  }
}
