import {
  CHEF_JACKET_GLTF_LOCAL,
  getCustomizerChefJacketGltfUrl,
  resolveCustomizerModelUrl,
} from '@/src/config/public-models'
import type { CustomizerProductData, CustomizerProductModel3d } from '../types/customizer-product.types'

/**
 * Optional placement anchor for decals/overlays projected onto the 3D model.
 * `null` means the anchor is not yet calibrated for this (mock) model.
 */
export type ModelAnchor = {
  position: [number, number, number]
  rotation?: [number, number, number]
} | null

/** Hints used to detect meshes/materials by (case-insensitive) name substrings. */
export type ModelNameHints = {
  body: string[]
  detail?: string[]
  buttons?: string[]
}

/** Bump when registry scale/position/rotation change (invalidates camera fit keys). */
export const CUSTOMIZER_TRANSFORM_VERSION = '1'

export const CHEF_JACKET_REGISTRY_KEY = 'chef-jacket'

export type CustomizerModelDefinition = {
  id: string
  /** Stable key for transform + fit — independent of R2/local URL. */
  registryKey: string
  label: string
  modelUrl: string
  /** Product type slugs this model can stand in for. */
  productTypes: string[]
  isMock: boolean
  /** Initial transform applied to the loaded scene. */
  scale: number
  position: [number, number, number]
  rotation: [number, number, number]
  materialHints: ModelNameHints
  meshHints: ModelNameHints
  anchors: {
    frontLeftChest: ModelAnchor
    backCenter: ModelAnchor
  }
}

const CHEF_JACKET_LOCAL_PATH = CHEF_JACKET_GLTF_LOCAL

const LOCAL_CHEF_JACKET_PRODUCT_TYPES = new Set(['chef-jacket', 'filipina'])

/**
 * CLO export uses ~cm coordinates (Y ≈ 91–167). Scale/position center the jacket
 * in the viewport (~1.5 units tall) without changing the procedural camera.
 */
const CHEF_JACKET_TRANSFORM = {
  scale: 0.02,
  position: [0, -2.55, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
}

/**
 * Material/mesh hints for MV2 Chef Jacket (chef-jacket.gltf).
 * - body: FABRIC 1_2333 on Cloth_mesh
 * - buttons: Default Button_2335 on Button_* meshes
 * - detail: no separate trim material in this export
 */
const CHEF_JACKET_MATERIAL_HINTS: ModelNameHints = {
  body: ['fabric', 'cloth', 'jacket', 'chef', 'thick', '2333'],
  detail: ['collar', 'cuff', 'trim', 'placket', 'vivo', 'detail', 'piping'],
  buttons: ['button', 'default button', '2335'],
}

const CHEF_JACKET_MESH_HINTS: ModelNameHints = {
  body: ['cloth', 'fabric', 'jacket', 'chef'],
}

/** Filipina / chef-jacket use the local glTF bundle (gltf + bin + textures same origin). */
export function prefersLocalChefJacketModel(productTypeSlug: string): boolean {
  return LOCAL_CHEF_JACKET_PRODUCT_TYPES.has(productTypeSlug)
}

/**
 * Resolves the URL for the chef-jacket glTF mock, in priority order:
 *
 * 1. `NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL` — exact URL (R2/CDN/local override).
 * 2. `NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL` — base URL; appends chef-jacket path.
 * 3. R2 public URL (`public/images/models/customizer/chef-jacket/chef-jacket.gltf`).
 * 4. Default local `/public/` path.
 */
function resolveChefJacketMockUrl(): string {
  const exact = process.env.NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL?.trim()
  if (exact && (exact.startsWith('/') || exact.startsWith('./'))) {
    return resolveCustomizerModelUrl(exact)
  }

  const r2OrLocal = getCustomizerChefJacketGltfUrl()
  if (r2OrLocal.startsWith('https://')) return r2OrLocal

  return CHEF_JACKET_LOCAL_PATH
}

/** Chef-jacket mock entry — `modelUrl` resolved lazily (not at module init). */
function buildChefJacketRegistryEntry(): CustomizerModelDefinition {
  return {
    id: 'chef-jacket-local',
    label: 'Filipina 3D (R2)',
    modelUrl: resolveChefJacketMockUrl(),
    productTypes: ['chef-jacket', 'filipina'],
    isMock: true,
    ...CHEF_JACKET_TRANSFORM,
    materialHints: CHEF_JACKET_MATERIAL_HINTS,
    meshHints: CHEF_JACKET_MESH_HINTS,
    anchors: {
      frontLeftChest: null,
      backCenter: null,
    },
  }
}

export const CUSTOMIZER_MODEL_REGISTRY: Record<string, CustomizerModelDefinition> = {
  get chefJacketLocal() {
    return buildChefJacketRegistryEntry()
  },
}

/**
 * Whether the mock GLB pipeline is enabled.
 * - `NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=true`  -> always on.
 * - `NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=false` -> always off.
 * - unset -> on only in development.
 */
/** Product-type → transform map (stable; independent of model URL). */
const PRODUCT_TYPE_TRANSFORMS: Record<
  string,
  Pick<CustomizerModelDefinition, 'scale' | 'position' | 'rotation' | 'registryKey'>
> = {
  'chef-jacket': { ...CHEF_JACKET_TRANSFORM, registryKey: CHEF_JACKET_REGISTRY_KEY },
  filipina: { ...CHEF_JACKET_TRANSFORM, registryKey: CHEF_JACKET_REGISTRY_KEY },
}

/** Registry transform by product type slug — not by model URL. */
export function getRegistryTransformForProductType(productTypeSlug: string): Pick<
  CustomizerModelDefinition,
  'scale' | 'position' | 'rotation'
> {
  const match = PRODUCT_TYPE_TRANSFORMS[productTypeSlug]
  if (match) {
    return {
      scale: match.scale,
      position: match.position,
      rotation: match.rotation,
    }
  }
  return CHEF_JACKET_TRANSFORM
}

export function getRegistryKeyForProductType(productTypeSlug: string): string {
  return PRODUCT_TYPE_TRANSFORMS[productTypeSlug]?.registryKey ?? CHEF_JACKET_REGISTRY_KEY
}

export function isCustomizerMockGlbEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB
  if (flag === 'true') return true
  if (flag === 'false') return false
  return process.env.NODE_ENV === 'development'
}

type ProductLike = Pick<CustomizerProductData, 'productTypeSlug'> & {
  model3d?: CustomizerProductModel3d | null
} | null | undefined

/**
 * Resolves the 3D model definition for a product, or `null` to use the
 * procedural fallback.
 *
 * Priority order:
 * 1. `product.model3d.url` — real model from DB/R2.
 * 2. `NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL` / `NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL`
 *    if the mock pipeline is enabled.
 * 3. Local chef-jacket glTF (dev only, if mock enabled and no remote URL set).
 * 4. Returns `null` → procedural fallback.
 */
export function getCustomizerModelForProduct(
  product: ProductLike,
): CustomizerModelDefinition | null {
  if (!product) return null

  const productType = product.productTypeSlug

  // Filipina / chef-jacket: always use local known-good bundle while 3D is stabilized.
  if (prefersLocalChefJacketModel(productType)) {
    return {
      ...buildChefJacketRegistryEntry(),
      modelUrl: CHEF_JACKET_LOCAL_PATH,
    }
  }

  // 1. Real product model from DB (non-filipina garments).
  if (product.model3d?.url) {
    const m3d = product.model3d
    const productType = product.productTypeSlug

    const registryMatch = Object.values(CUSTOMIZER_MODEL_REGISTRY).find((m) =>
      m.productTypes.includes(productType),
    )
    const baseMaterialHints = registryMatch?.materialHints ?? CHEF_JACKET_MATERIAL_HINTS
    const baseMeshHints = registryMatch?.meshHints ?? CHEF_JACKET_MESH_HINTS
    const baseTransform = getRegistryTransformForProductType(productType)
    const registryKey = getRegistryKeyForProductType(productType)

    return {
      id: m3d.id,
      registryKey,
      label: `Modelo 3D: ${m3d.fileName}`,
      modelUrl: resolveCustomizerModelUrl(m3d.url),
      productTypes: [productType],
      isMock: false,
      ...baseTransform,
      materialHints:
        m3d.materialHintsJson && typeof m3d.materialHintsJson === 'object'
          ? (m3d.materialHintsJson as typeof baseMaterialHints)
          : baseMaterialHints,
      meshHints:
        m3d.meshHintsJson && typeof m3d.meshHintsJson === 'object'
          ? (m3d.meshHintsJson as typeof baseMeshHints)
          : baseMeshHints,
      anchors: {
        frontLeftChest: null,
        backCenter: null,
        ...(m3d.anchorsJson && typeof m3d.anchorsJson === 'object'
          ? (m3d.anchorsJson as { frontLeftChest?: null; backCenter?: null })
          : {}),
      },
    }
  }

  // 2–3. Mock pipeline for other garment types.
  if (!isCustomizerMockGlbEnabled()) return null

  const match = Object.values(CUSTOMIZER_MODEL_REGISTRY).find((model) =>
    model.productTypes.includes(productType),
  )
  if (!match) return null

  return {
    ...match,
    modelUrl: resolveCustomizerModelUrl(match.modelUrl),
  }
}
