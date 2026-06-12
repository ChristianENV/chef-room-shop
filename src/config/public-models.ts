import { buildPublicR2ObjectUrl, getPublicR2BaseUrl } from '@/src/config/public-images'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'

/** App URL prefix for customizer garment models under `public/images/models/customizer/`. */
export const CUSTOMIZER_MODELS_PUBLIC_PREFIX = '/images/models/customizer'

export const CHEF_JACKET_MODEL_PUBLIC_DIR = `${CUSTOMIZER_MODELS_PUBLIC_PREFIX}/chef-jacket`

export const CHEF_JACKET_GLTF_LOCAL = `${CHEF_JACKET_MODEL_PUBLIC_DIR}/chef-jacket.gltf`

/** Bump when remote customizer model assets change (cache bust query param). */
export const CUSTOMIZER_MODEL_CACHE_VERSION = '2'

const CHEF_JACKET_R2_KEY = 'public/images/models/customizer/chef-jacket/chef-jacket.gltf'

/**
 * Public URL for the legacy chef-jacket glTF on Cloudflare R2 (env-fallback only).
 * Prefer `product.model3d.url` (single `.glb` per product) in production.
 */
export function getCustomizerChefJacketGltfUrl(): string {
  const base = getPublicR2BaseUrl()
  if (base) {
    return buildPublicR2ObjectUrl(base, CHEF_JACKET_R2_KEY)
  }
  return CHEF_JACKET_GLTF_LOCAL
}

/** True when the URL points at the local chef-jacket glTF path. */
export function isLocalChefJacketGltfUrl(url: string): boolean {
  const trimmed = url.trim()
  return (
    trimmed === CHEF_JACKET_GLTF_LOCAL ||
    trimmed.endsWith('/chef-jacket/chef-jacket.gltf')
  )
}

/** True when the URL is a same-origin local model path under `public/images/models/customizer/`. */
export function isLocalCustomizerModelPath(url: string): boolean {
  const trimmed = url.trim()
  return trimmed.startsWith(`${CUSTOMIZER_MODELS_PUBLIC_PREFIX}/`)
}

/**
 * Appends `?v=` cache bust to remote/proxied model URLs.
 * Local `/images/models/customizer/...` paths are left unchanged.
 */
export function appendCustomizerModelCacheBust(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (isLocalCustomizerModelPath(trimmed)) return trimmed

  const separator = trimmed.includes('?') ? '&' : '?'
  return `${trimmed}${separator}v=${CUSTOMIZER_MODEL_CACHE_VERSION}`
}

/**
 * Resolves a catalog/customizer model URL for WebGL loading:
 * - Rewrites public R2 HTTPS URLs to same-origin `/r2/...` (avoids CORS).
 * - Leaves local `/images/models/customizer/...` paths unchanged (dev fallback).
 * - Appends cache-bust query on remote/proxied URLs.
 */
export function resolveCustomizerModelUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed

  // Local chef-jacket path → R2 when bucket public URL is configured (no file on disk).
  let resolved = trimmed
  if (isLocalChefJacketGltfUrl(trimmed)) {
    const remote = getCustomizerChefJacketGltfUrl()
    if (remote.startsWith('https://')) {
      resolved = remote
    }
  }

  const proxied = toSameOriginR2Url(resolved) ?? resolved
  return appendCustomizerModelCacheBust(proxied)
}
