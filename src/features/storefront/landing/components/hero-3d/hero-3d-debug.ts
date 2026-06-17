import { HERO_3D_MODEL_URL } from './hero-3d-config'

export type Hero3DModelLoadState = 'idle' | 'loading' | 'loaded' | 'error'

export type HeroAssetLoadState = 'idle' | 'loading' | 'loaded' | 'error'

export type HeroModelPreparedState = 'idle' | 'preparing' | 'prepared' | 'error'

export type HeroBoundsFitState = 'idle' | 'fitting' | 'fitted' | 'fallback' | 'error'

export type Hero3DRenderMode = '3d' | 'static-fallback'

export type Hero3DDebugState = {
  renderMode: Hero3DRenderMode
  canvasMounted: boolean
  canvasSize: { width: number; height: number }
  modelUrl: string
  assetLoadState: HeroAssetLoadState
  modelPreparedState: HeroModelPreparedState
  boundsFitState: HeroBoundsFitState
  hero3dReady: boolean
  modelLoadState: Hero3DModelLoadState
  meshCount: number
  boundsSize: [number, number, number] | null
  boundsCenter: [number, number, number] | null
  radius: number | null
  cameraPosition: [number, number, number] | null
  fittedCameraDistance: number | null
  paddingRatio: number | null
  fitCalculationCount: number | null
  cameraUpdateCount: number | null
  modelCloneCount: number | null
  errorMessage: string | null
  lastError: string | null
  fallbackReason: string | null
  assetsAvailable: boolean | null
  timeoutTriggered: boolean
  visibleMeshCount: number
  materialNames: string[]
  materialOpacities: number[]
  materialTransparentFlags: boolean[]
  boundsMin: [number, number, number] | null
  boundsMax: [number, number, number] | null
  cameraTarget: [number, number, number] | null
}

export const HERO_3D_MODEL_ASSET_PATHS = [
  '/models/customizer/chef-jacket/chef-jacket.gltf',
  '/models/customizer/chef-jacket/chef-jacket.bin',
  '/models/customizer/chef-jacket/chef-jacket-diffuse.png',
  '/models/customizer/chef-jacket/chef-jacket-normal.png',
  '/models/customizer/chef-jacket/chef-jacket-metallicroughness.png',
] as const

export function isLandingHero3dDebugEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LANDING_HERO_3D_DEBUG === 'true'
}

export function isLandingHero3dCalibrateEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LANDING_HERO_3D_CALIBRATE === 'true'
}

export function isLandingHero3dDebugMaterialEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LANDING_HERO_3D_DEBUG_MATERIAL === 'true'
}

export function hero3dLog(message: string, ...details: unknown[]): void {
  if (process.env.NODE_ENV !== 'development' && !isLandingHero3dDebugEnabled()) return
  if (details.length > 0) {
    console.log(`[Hero3D] ${message}`, ...details)
    return
  }
  console.log(`[Hero3D] ${message}`)
}

export function createInitialHero3DDebugState(): Hero3DDebugState {
  return {
    renderMode: '3d',
    canvasMounted: false,
    canvasSize: { width: 0, height: 0 },
    modelUrl: HERO_3D_MODEL_URL,
    assetLoadState: 'idle',
    modelPreparedState: 'idle',
    boundsFitState: 'idle',
    hero3dReady: false,
    modelLoadState: 'idle',
    meshCount: 0,
    boundsSize: null,
    boundsCenter: null,
    radius: null,
    cameraPosition: null,
    fittedCameraDistance: null,
    paddingRatio: null,
    fitCalculationCount: null,
    cameraUpdateCount: null,
    modelCloneCount: null,
    errorMessage: null,
    lastError: null,
    fallbackReason: null,
    assetsAvailable: null,
    timeoutTriggered: false,
    visibleMeshCount: 0,
    materialNames: [],
    materialOpacities: [],
    materialTransparentFlags: [],
    boundsMin: null,
    boundsMax: null,
    cameraTarget: null,
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
