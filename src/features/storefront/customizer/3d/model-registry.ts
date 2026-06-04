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

export type CustomizerModelDefinition = {
  id: string
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

/**
 * Resolves the URL for the mock GLB, in priority order:
 *
 * 1. `NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL` — exact URL (R2/CDN/local override).
 * 2. `NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL` — base URL; appends the relative path.
 * 3. Default local `/public/` path (works in local dev; absent on Vercel → fallback).
 */
function resolveMockGlbUrl(): string {
  const exact = process.env.NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL
  if (exact) return exact

  const base = process.env.NEXT_PUBLIC_CUSTOMIZER_MODEL_BASE_URL
  if (base) return `${base.replace(/\/$/, '')}/mock-dress-combi/mock-dress-combi.glb`

  return '/models/customizer/mock-dress-combi/mock-dress-combi.glb'
}

export const CUSTOMIZER_MODEL_REGISTRY: Record<string, CustomizerModelDefinition> = {
  mockDressCombi: {
    id: 'mock-dress-combi',
    label: 'Mock técnico vestido',
    modelUrl: resolveMockGlbUrl(),
    productTypes: ['chef-jacket'],
    isMock: true,
    scale: 1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    // Detected via GLB inspection (see docs/customizer-3d-mock.md):
    //  - material "Dress_Womens_Combi_short_1002" -> body
    //  - material "Material__32"                  -> detail
    materialHints: {
      body: ['dress', 'body', 'garment', 'fabric', 'cloth'],
      detail: ['material__32', 'material_', 'trim', 'detail', 'collar', 'cuff', 'placket'],
      buttons: ['button', 'snap', 'zipper'],
    },
    meshHints: {
      body: ['dress', 'body', 'garment'],
    },
    anchors: {
      frontLeftChest: null,
      backCenter: null,
    },
  },
}

/**
 * Whether the mock GLB pipeline is enabled.
 * - `NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=true`  -> always on.
 * - `NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB=false` -> always off.
 * - unset -> on only in development.
 */
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
 * 3. Local mock GLB (dev only, if mock enabled and no remote URL set).
 * 4. Returns `null` → procedural fallback.
 */
export function getCustomizerModelForProduct(
  product: ProductLike,
): CustomizerModelDefinition | null {
  if (!product) return null

  // 1. Real product model from DB.
  if (product.model3d?.url) {
    const m3d = product.model3d
    const productType = product.productTypeSlug

    // Parse hints stored in DB or fall back to registry hints for this product type.
    const registryMatch = Object.values(CUSTOMIZER_MODEL_REGISTRY).find((m) =>
      m.productTypes.includes(productType),
    )
    const baseMaterialHints = registryMatch?.materialHints ?? {
      body: ['body', 'fabric', 'cloth', 'garment'],
      detail: ['detail', 'trim', 'collar', 'cuff'],
      buttons: ['button', 'snap', 'zipper'],
    }
    const baseMeshHints = registryMatch?.meshHints ?? { body: ['body', 'garment'] }

    return {
      id: m3d.id,
      label: `Modelo 3D: ${m3d.fileName}`,
      modelUrl: m3d.url,
      productTypes: [productType],
      isMock: false,
      scale: 1,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
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

  // 2–3. Mock pipeline.
  if (!isCustomizerMockGlbEnabled()) return null

  const productType = product.productTypeSlug
  const match = Object.values(CUSTOMIZER_MODEL_REGISTRY).find((model) =>
    model.productTypes.includes(productType),
  )
  return match ?? null
}
