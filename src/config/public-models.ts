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
 * Stable local chef-jacket glTF (served from `/public/models/...`).
 * Remote R2 is opt-in via `NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL` only.
 */
export function getCustomizerChefJacketGltfUrl(): string {
  return CHEF_JACKET_GLTF_LOCAL
}

/** Remote R2 chef-jacket URL when explicitly needed (upload scripts, diagnostics). */
export function getCustomizerChefJacketGltfRemoteUrl(): string {
  const base = getPublicR2BaseUrl()
  if (!base) return CHEF_JACKET_GLTF_LOCAL
  return resolveRemoteCustomizerModelUrl(
    buildPublicR2ObjectUrl(base, CHEF_JACKET_R2_KEY),
  )
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
 * Resolves customizer model URLs.
 * Local chef-jacket paths stay same-origin (gltf + bin + textures must not mix hosts).
 */
export function resolveCustomizerModelUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return CHEF_JACKET_GLTF_LOCAL
  if (isLocalChefJacketGltfUrl(trimmed)) return trimmed
  return resolveRemoteCustomizerModelUrl(trimmed)
}
