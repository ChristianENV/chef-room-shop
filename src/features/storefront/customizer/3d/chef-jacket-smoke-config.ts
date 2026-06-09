import { CHEF_JACKET_GLTF_LOCAL } from '@/src/config/public-models'

export const CHEF_JACKET_SMOKE_MODEL_URL = CHEF_JACKET_GLTF_LOCAL

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

export const CHEF_JACKET_SMOKE_ASSET_PATHS = [
  '/models/customizer/chef-jacket/chef-jacket.gltf',
  '/models/customizer/chef-jacket/chef-jacket.bin',
  '/models/customizer/chef-jacket/chef-jacket-diffuse.png',
  '/models/customizer/chef-jacket/chef-jacket-normal.png',
  '/models/customizer/chef-jacket/chef-jacket-metallicroughness.png',
] as const

export function isDevDiagnosticsRouteEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_DEV_DIAGNOSTICS === 'true') return true
  return process.env.NODE_ENV !== 'production'
}
