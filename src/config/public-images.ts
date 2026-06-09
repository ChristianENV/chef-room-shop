import manifest from '@/src/generated/r2-public-images.manifest.json'

type PublicImagesManifest = Record<string, string>

const manifestMap = manifest as PublicImagesManifest

/** Normalizes app paths like `/images/landing/foo.png`. */
export function normalizePublicAssetPath(localPath: string): string {
  const trimmed = localPath.trim()
  if (!trimmed) return '/'
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/**
 * Public CDN base URL for client/server rendering.
 * Falls back to server-only `R2_PUBLIC_BASE_URL` during SSR/build when unset on client.
 */
export function getPublicR2BaseUrl(): string | null {
  const clientBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim()
  if (clientBase) return clientBase.replace(/\/+$/, '')

  if (typeof window === 'undefined') {
    const serverBase = process.env.R2_PUBLIC_BASE_URL?.trim()
    return serverBase ? serverBase.replace(/\/+$/, '') : null
  }

  return null
}

/**
 * Resolves a local `/public` asset path to its R2 URL when present in the manifest.
 * Falls back to the original local path so `/public` files keep working offline.
 */
export function getPublicImageUrl(localPath: string): string {
  const key = normalizePublicAssetPath(localPath)
  const mapped = manifestMap[key]
  if (mapped) return mapped
  return key
}

/** True when the manifest contains an R2 URL for the given local asset path. */
export function isPublicImageOnR2(localPath: string): boolean {
  const key = normalizePublicAssetPath(localPath)
  return Boolean(manifestMap[key])
}

/** Builds an absolute HTTPS public URL for an R2 object key. */
export function buildPublicR2ObjectUrl(publicBaseUrl: string, r2Key: string): string {
  const base = publicBaseUrl.replace(/\/+$/, '')
  const key = r2Key.replace(/^\/+/, '')
  const url = new URL(key, `${base}/`)
  if (url.protocol !== 'https:') {
    throw new Error(`Public URL must use https: ${url.toString()}`)
  }
  return url.toString()
}
