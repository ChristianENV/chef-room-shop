import {
  CHEF_JACKET_GLTF_LOCAL,
  resolveCustomizerModelUrl,
} from '@/src/config/public-models'

const envSmokeUrl = process.env.NEXT_PUBLIC_CUSTOMIZER_SMOKE_MODEL_URL?.trim()
const envMockUrl = process.env.NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL?.trim()

/** Isolated smoke scene model — prefer explicit env URL over legacy local glTF. */
export const CHEF_JACKET_SMOKE_MODEL_URL = resolveCustomizerModelUrl(
  envSmokeUrl || envMockUrl || CHEF_JACKET_GLTF_LOCAL,
)

export const CHEF_JACKET_SMOKE_TRANSFORM = {
  scale: 0.02,
  position: [0, -2.55, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
}

export const CHEF_JACKET_SMOKE_CAMERA = {
  position: [0, 1.5, 5] as [number, number, number],
  fov: 35,
  target: [0, 0.8, 0] as [number, number, number],
}

/** Single URL checked by `pnpm customizer:verify-assets` (legacy name). */
export const CHEF_JACKET_SMOKE_ASSET_PATHS = [CHEF_JACKET_SMOKE_MODEL_URL] as const

export function isDevDiagnosticsRouteEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_DEV_DIAGNOSTICS === 'true') return true
  return process.env.NODE_ENV !== 'production'
}
