import { CHEF_JACKET_GLTF_LOCAL } from '@/src/config/public-models'

/** Local chef-jacket glTF — stable same-origin bundle for landing showcase. */
export const HERO_3D_MODEL_URL = CHEF_JACKET_GLTF_LOCAL

/**
 * Matches the stabilized chef-jacket transform used in the customizer smoke viewport.
 * Duplicated here to keep the landing hero isolated from customizer modules.
 */
export const HERO_3D_JACKET_TRANSFORM = {
  scale: 0.02,
  position: [0, -2.55, 0] as [number, number, number],
  /** Slight 3/4 turn for a premium hero angle. */
  rotation: [0, -0.42, 0] as [number, number, number],
}

export const HERO_3D_CAMERA = {
  position: [1.15, 1.05, 4.35] as [number, number, number],
  fov: 34,
  target: [0, 0.55, 0] as [number, number, number],
}

/** Idle showcase motion — radians per second. */
export const HERO_3D_IDLE_ROTATION_SPEED = 0.22

/** Subtle vertical float amplitude (world units). */
export const HERO_3D_FLOAT_AMPLITUDE = 0.06
