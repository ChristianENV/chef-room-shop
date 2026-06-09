import { buildPublicR2ObjectUrl, getPublicR2BaseUrl } from '@/src/config/public-images'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'

export const CHEF_JACKET_GLTF_LOCAL = '/models/customizer/chef-jacket/chef-jacket.gltf'
const CHEF_JACKET_R2_KEY = 'public/images/models/customizer/chef-jacket/chef-jacket.gltf'

/**
 * Bump when R2 model bytes/encoding change to bust long-lived browser cache
 * (`Cache-Control: immutable` on prior UTF-16 uploads).
 */
const CUSTOMIZER_MODEL_CACHE_VERSION =
  process.env.NEXT_PUBLIC_CUSTOMIZER_MODEL_CACHE_VERSION?.trim() || '2'

/** Appends `?v=` so clients skip stale immutable cache entries. */
export function appendCustomizerModelCacheBust(url: string): string {
  const version = CUSTOMIZER_MODEL_CACHE_VERSION

  if (url.startsWith('/r2/')) {
    if (url.includes(`v=${version}`)) return url
    return `${url}${url.includes('?') ? '&' : '?'}v=${version}`
  }

  if (!url.startsWith('https://')) return url

  try {
    const parsed = new URL(url)
    parsed.searchParams.set('v', version)
    return parsed.toString()
  } catch {
    return url
  }
}

function resolveRemoteCustomizerModelUrl(url: string): string {
  const sameOrigin = toSameOriginR2Url(url) ?? url
  return appendCustomizerModelCacheBust(sameOrigin)
}

/**
 * Public URL for the chef-jacket glTF on Cloudflare R2.
 * Resolved at call time so `NEXT_PUBLIC_*` env is always read fresh.
 */
export function getCustomizerChefJacketGltfUrl(): string {
  const base = getPublicR2BaseUrl()
  if (base) {
    return resolveRemoteCustomizerModelUrl(
      buildPublicR2ObjectUrl(base, CHEF_JACKET_R2_KEY),
    )
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

/**
 * Rewrites known local chef-jacket paths to the Cloudflare R2 public URL.
 */
export function resolveCustomizerModelUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return getCustomizerChefJacketGltfUrl()
  if (isLocalChefJacketGltfUrl(trimmed)) {
    const remote = getCustomizerChefJacketGltfUrl()
    if (remote.startsWith('https://') || remote.startsWith('/r2/')) return remote
    return trimmed
  }
  return resolveRemoteCustomizerModelUrl(trimmed)
}
