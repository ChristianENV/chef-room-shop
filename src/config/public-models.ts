import { buildPublicR2ObjectUrl, getPublicR2BaseUrl } from '@/src/config/public-images'

export const CHEF_JACKET_GLTF_LOCAL = '/models/customizer/chef-jacket/chef-jacket.gltf'
const CHEF_JACKET_R2_KEY = 'public/images/models/customizer/chef-jacket/chef-jacket.gltf'

/**
 * Public URL for the chef-jacket glTF on Cloudflare R2.
 * Resolved at call time so `NEXT_PUBLIC_*` env is always read fresh.
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
  return trimmed === CHEF_JACKET_GLTF_LOCAL || trimmed.endsWith('/chef-jacket/chef-jacket.gltf')
}

/**
 * Appends a cache-bust `?v=2` query parameter to R2 URLs (both direct HTTPS
 * and same-origin `/r2` proxy paths). Local paths are returned unchanged.
 */
export function appendCustomizerModelCacheBust(url: string): string {
  const trimmed = url.trim()
  const isR2 = trimmed.startsWith('https://') || trimmed.startsWith('/r2')
  if (!isR2) return trimmed
  return trimmed.includes('?') ? `${trimmed}&v=2` : `${trimmed}?v=2`
}

/**
 * Rewrites known local chef-jacket paths to the Cloudflare R2 public URL.
 */
export function resolveCustomizerModelUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return getCustomizerChefJacketGltfUrl()
  if (isLocalChefJacketGltfUrl(trimmed)) {
    const remote = getCustomizerChefJacketGltfUrl()
    if (remote.startsWith('https://')) return remote
  }
  return trimmed
}
