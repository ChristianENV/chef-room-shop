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

export type HeroJacketComposition = {
  modelPosition: [number, number, number]
  modelScale: number
  modelRotationX: number
  modelRotationY: number
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  cameraFov: number
  idleRotationSpeed: number
  dragRotationLimit: number
  dragSensitivity: number
  floatAmplitude: number
  glowOffsetX: number
  glowOffsetY: number
  pedestalOffsetY: number
  pedestalShadowY: number
}

/** Single source of truth for landing hero 3D jacket framing. */
export const HERO_JACKET_COMPOSITION: HeroJacketComposition = {
  modelPosition: [0, -3.2, 0],
  modelScale: 0.02,
  modelRotationX: -0.03,
  modelRotationY: -0.72,
  cameraPosition: [0.45, 0.85, 5.3],
  cameraTarget: [0, -0.75, 0],
  cameraFov: 35,
  idleRotationSpeed: 0.04,
  dragRotationLimit: 0.32,
  dragSensitivity: 0.004,
  floatAmplitude: 0.035,
  glowOffsetX: 0,
  glowOffsetY: 24,
  pedestalOffsetY: 36,
  pedestalShadowY: -1.72,
}

/** JSON shape emitted by the calibration panel "Copy config" action. */
export function compositionToCalibrationJson(composition: HeroJacketComposition) {
  return {
    modelPosition: composition.modelPosition,
    modelScale: composition.modelScale,
    modelRotationY: composition.modelRotationY,
    cameraPosition: composition.cameraPosition,
    cameraTarget: composition.cameraTarget,
    cameraFov: composition.cameraFov,
    glowOffsetX: composition.glowOffsetX,
    glowOffsetY: composition.glowOffsetY,
    pedestalOffsetY: composition.pedestalOffsetY,
    idleRotationSpeed: composition.idleRotationSpeed,
  }
}

export function cloneComposition(composition: HeroJacketComposition): HeroJacketComposition {
  return {
    ...composition,
    modelPosition: [...composition.modelPosition] as [number, number, number],
    cameraPosition: [...composition.cameraPosition] as [number, number, number],
    cameraTarget: [...composition.cameraTarget] as [number, number, number],
  }
}
