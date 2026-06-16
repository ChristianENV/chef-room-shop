import { HERO_3D_MODEL_URL } from './hero-3d-config'

export type Hero3DModelLoadState = 'idle' | 'loading' | 'loaded' | 'error'

export type Hero3DRenderMode = '3d' | 'static-fallback'

export type Hero3DDebugState = {
  renderMode: Hero3DRenderMode
  canvasMounted: boolean
  canvasSize: { width: number; height: number }
  modelUrl: string
  modelLoadState: Hero3DModelLoadState
  meshCount: number
  boundsSize: [number, number, number] | null
  boundsCenter: [number, number, number] | null
  radius: number | null
  cameraPosition: [number, number, number] | null
  errorMessage: string | null
  fallbackReason: string | null
  assetsAvailable: boolean | null
}

export const HERO_3D_MODEL_ASSET_PATHS = [
  '/models/customizer/chef-jacket/chef-jacket.gltf',
  '/models/customizer/chef-jacket/chef-jacket.bin',
  '/models/customizer/chef-jacket/chef-jacket-diffuse.png',
  '/models/customizer/chef-jacket/chef-jacket-normal.png',
  '/models/customizer/chef-jacket/chef-jacket-metallicroughness.png',
] as const

export function isLandingHero3dDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_LANDING_HERO_3D_DEBUG === 'true') return true
  return process.env.NODE_ENV === 'development'
}

export function isLandingHero3dDebugMaterialEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LANDING_HERO_3D_DEBUG_MATERIAL === 'true'
}

export function createInitialHero3DDebugState(): Hero3DDebugState {
  return {
    renderMode: '3d',
    canvasMounted: false,
    canvasSize: { width: 0, height: 0 },
    modelUrl: HERO_3D_MODEL_URL,
    modelLoadState: 'idle',
    meshCount: 0,
    boundsSize: null,
    boundsCenter: null,
    radius: null,
    cameraPosition: null,
    errorMessage: null,
    fallbackReason: null,
    assetsAvailable: null,
  }
}

export async function checkHero3DModelAssetsAvailable(): Promise<boolean> {
  try {
    const results = await Promise.all(
      HERO_3D_MODEL_ASSET_PATHS.map(async (path) => {
        const response = await fetch(path, { method: 'HEAD', cache: 'no-store' })
        return response.ok
      }),
    )
    return results.every(Boolean)
  } catch {
    return false
  }
}
