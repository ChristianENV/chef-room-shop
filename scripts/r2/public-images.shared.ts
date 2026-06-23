import path from 'node:path'

/** Allowed static image extensions under `/public`. */
export const PUBLIC_IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.svg',
  '.gif',
])

/** R2 object prefix for migrated storefront static images. */
export const R2_PUBLIC_IMAGES_PREFIX = 'public/images'

/**
 * Assets excluded from R2 migration (stay local):
 * - favicon / PWA / browser metadata
 * - root app icons referenced from `src/app/layout.tsx`
 * - framework placeholders
 * - GLTF/GLB/BIN model bundles (textures are remapped separately)
 */
export function shouldExcludePublicImage(relativeFromPublic: string): boolean {
  const normalized = relativeFromPublic.replace(/\\/g, '/')
  const lower = normalized.toLowerCase()
  const basename = path.posix.basename(lower)

  if (basename === 'favicon.ico') return true
  if (basename.includes('favicon')) return true
  if (basename.startsWith('apple-touch-icon')) return true
  if (basename.startsWith('android-chrome')) return true
  if (basename.startsWith('mstile')) return true
  if (basename.startsWith('mask-icon')) return true
  if (basename.startsWith('safari-pinned-tab')) return true
  if (basename === 'site.webmanifest') return true
  if (basename === 'manifest.json' || basename === 'manifest.webmanifest') return true
  if (basename === 'browserconfig.xml') return true
  if (basename === 'apple-icon.png') return true
  if (/^icon-(light|dark)-\d+x\d+\./.test(basename)) return true
  if (basename.startsWith('web-app-manifest')) return true
  if (basename === 'icon.svg' || basename === 'icon0.svg' || basename === 'icon1.png') return true
  if (basename === 'next.svg' || basename === 'vercel.svg') return true

  const ext = path.posix.extname(lower)
  if (ext === '.gltf' || ext === '.glb' || ext === '.bin') return true

  return !PUBLIC_IMAGE_EXTENSIONS.has(ext)
}

/**
 * Maps a file under `public/` to its R2 object key.
 *
 * - `public/images/landing/foo.png` → `public/images/landing/foo.png`
 * - `public/models/customizer/.../tex.png` → `public/images/models/customizer/.../tex.png`
 */
export function mapPublicFileToR2Key(relativeFromPublic: string): string {
  const normalized = relativeFromPublic.replace(/\\/g, '/')
  if (normalized.startsWith('images/')) {
    return `${R2_PUBLIC_IMAGES_PREFIX}/${normalized.slice('images/'.length)}`
  }
  if (normalized.startsWith('models/')) {
    return `${R2_PUBLIC_IMAGES_PREFIX}/${normalized}`
  }
  return `${R2_PUBLIC_IMAGES_PREFIX}/${normalized}`
}

/** App-facing local path used in React/Next (leading slash). */
export function toManifestLocalPath(relativeFromPublic: string): string {
  const normalized = relativeFromPublic.replace(/\\/g, '/')
  return `/${normalized}`
}

export function contentTypeForExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.avif':
      return 'image/avif'
    case '.svg':
      return 'image/svg+xml'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

export const STATIC_CACHE_CONTROL = 'public, max-age=31536000, immutable'

/** glTF/GLB JSON — avoid `immutable` so encoding fixes can propagate. */
export const MODEL_GLTF_CACHE_CONTROL = 'public, max-age=86400'

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

export function getExcludeReason(relativeFromPublic: string): string {
  const normalized = relativeFromPublic.replace(/\\/g, '/')
  const lower = normalized.toLowerCase()
  const basename = path.posix.basename(lower)
  const ext = path.posix.extname(lower)

  if (ext === '.gltf' || ext === '.glb' || ext === '.bin') return 'model bundle excluded'
  if (basename === 'favicon.ico' || basename.includes('favicon')) return 'favicon excluded'
  if (basename.startsWith('apple-touch-icon')) return 'apple-touch-icon excluded'
  if (basename.startsWith('android-chrome')) return 'android-chrome excluded'
  if (basename.startsWith('mstile')) return 'mstile excluded'
  if (basename.startsWith('mask-icon')) return 'mask-icon excluded'
  if (basename.startsWith('safari-pinned-tab')) return 'safari-pinned-tab excluded'
  if (basename === 'site.webmanifest') return 'PWA manifest excluded'
  if (basename === 'manifest.json' || basename === 'manifest.webmanifest')
    return 'manifest excluded'
  if (basename === 'browserconfig.xml') return 'browser metadata excluded'
  if (basename === 'apple-icon.png') return 'app icon excluded'
  if (/^icon-(light|dark)-\d+x\d+\./.test(basename)) return 'browser tab icon excluded'
  if (basename.startsWith('web-app-manifest')) return 'PWA install icon excluded'
  if (basename === 'icon.svg' || basename === 'icon0.svg' || basename === 'icon1.png') {
    return 'app icon excluded'
  }
  if (basename === 'next.svg' || basename === 'vercel.svg') return 'framework placeholder excluded'
  if (!PUBLIC_IMAGE_EXTENSIONS.has(ext)) return 'unsupported file type'
  return 'excluded by policy'
}
