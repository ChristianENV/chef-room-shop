import { getPublicR2BaseUrl } from '@/src/config/public-images'

const SAME_ORIGIN_R2_PREFIX = '/r2/'

/**
 * Rewrites a public R2 HTTPS URL to a same-origin path (`/r2/...`) proxied by Next.js.
 * Avoids browser CORS blocks for canvas textures, WebGL, and html-to-image capture.
 */
export function toSameOriginR2Url(url: string | null | undefined): string | null {
  if (!url?.trim()) return null

  const trimmed = url.trim()
  if (trimmed.startsWith(SAME_ORIGIN_R2_PREFIX)) return trimmed
  if (trimmed.startsWith('/')) return trimmed

  const base = getPublicR2BaseUrl()
  if (base && trimmed.startsWith(`${base}/`)) {
    const objectPath = trimmed.slice(base.length).replace(/^\//, '')
    const queryIndex = objectPath.indexOf('?')
    if (queryIndex >= 0) {
      return `${SAME_ORIGIN_R2_PREFIX}${objectPath.slice(0, queryIndex)}${objectPath.slice(queryIndex)}`
    }
    return `${SAME_ORIGIN_R2_PREFIX}${objectPath}`
  }

  try {
    const parsed = new URL(trimmed)
    if (!base) return trimmed

    const baseUrl = new URL(base.endsWith('/') ? base : `${base}/`)
    if (parsed.origin !== baseUrl.origin) return trimmed

    const objectPath = `${parsed.pathname.replace(/^\//, '')}${parsed.search}`
    return `${SAME_ORIGIN_R2_PREFIX}${objectPath}`
  } catch {
    return trimmed
  }
}
