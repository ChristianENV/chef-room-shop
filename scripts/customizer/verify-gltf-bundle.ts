/**
 * Verifies a chef-jacket glTF bundle and all relative dependencies (bin + textures).
 *
 * Usage:
 *   pnpm customizer:verify-gltf-bundle
 *   BASE_URL=http://localhost:3000 pnpm customizer:verify-gltf-bundle
 *   GLTF_URL=/r2/public/images/models/customizer/chef-jacket/chef-jacket.gltf?v=2 pnpm customizer:verify-gltf-bundle
 */
import { resolveCustomizerModelUrl } from '../../src/config/public-models'

const DEFAULT_BASE = process.env.BASE_URL ?? 'http://localhost:3000'
const DEFAULT_GLTF = resolveCustomizerModelUrl(
  process.env.GLTF_URL?.trim() ||
    '/r2/public/images/models/customizer/chef-jacket/chef-jacket.gltf',
)

function toAbsoluteUrl(baseUrl: string, modelUrl: string): string {
  if (modelUrl.startsWith('http://') || modelUrl.startsWith('https://')) return modelUrl
  return `${baseUrl.replace(/\/$/, '')}${modelUrl.startsWith('/') ? '' : '/'}${modelUrl}`
}

function extractBasePath(absoluteGltfUrl: string): string {
  const withoutQuery = absoluteGltfUrl.split('?')[0] ?? absoluteGltfUrl
  const index = withoutQuery.lastIndexOf('/')
  if (index < 0) return './'
  return `${withoutQuery.slice(0, index + 1)}`
}

function isValidPng(buffer: Buffer): boolean {
  if (buffer.length < 24) return false
  if (buffer.readUInt32BE(0) !== 0x89504e47) return false
  return buffer.includes(Buffer.from('IEND'))
}

async function checkAsset(basePath: string, relativeUri: string) {
  const url = new URL(relativeUri, basePath).toString()
  const head = await fetch(url, { method: 'HEAD' })
  let status = head.status
  let contentType = head.headers.get('content-type')?.split(';')[0].trim() ?? ''
  let bytes = Number(head.headers.get('content-length') ?? 0)

  if (!head.ok) {
    const get = await fetch(url, { method: 'GET' })
    status = get.status
    contentType = get.headers.get('content-type')?.split(';')[0].trim() ?? ''
    const body = Buffer.from(await get.arrayBuffer())
    bytes = body.length
    return { relativeUri, url, status, contentType, bytes, pngValid: null as boolean | null, ok: get.ok }
  }

  if (relativeUri.toLowerCase().endsWith('.png')) {
    const get = await fetch(url, { method: 'GET' })
    const body = Buffer.from(await get.arrayBuffer())
    bytes = body.length
    return {
      relativeUri,
      url,
      status: get.status,
      contentType,
      bytes,
      pngValid: isValidPng(body),
      ok: get.ok && isValidPng(body),
    }
  }

  return {
    relativeUri,
    url,
    status,
    contentType,
    bytes,
    pngValid: null,
    ok: head.ok && bytes > 0,
  }
}

async function main() {
  const baseUrl = DEFAULT_BASE.replace(/\/$/, '')
  const gltfUrl = toAbsoluteUrl(baseUrl, DEFAULT_GLTF)
  console.info(`[verify-gltf-bundle] gltf=${gltfUrl}`)

  const gltfRes = await fetch(gltfUrl)
  if (!gltfRes.ok) {
    throw new Error(`GLTF fetch failed: ${gltfRes.status} ${gltfUrl}`)
  }

  const gltf = (await gltfRes.json()) as {
    buffers?: Array<{ uri?: string }>
    images?: Array<{ uri?: string }>
  }

  const uris = [
    ...(gltf.buffers ?? []).map((b) => b.uri).filter(Boolean),
    ...(gltf.images ?? []).map((i) => i.uri).filter(Boolean),
  ] as string[]

  const basePath = extractBasePath(gltfUrl)
  const results = await Promise.all(uris.map((uri) => checkAsset(basePath, uri)))

  let failed = 0
  for (const result of results) {
    const mark = result.ok ? 'OK' : 'FAIL'
    console.info(
      `${mark} ${result.status} ${result.relativeUri} type=${result.contentType || '(missing)'} bytes=${result.bytes}` +
        (result.pngValid !== null ? ` pngValid=${result.pngValid}` : ''),
    )
    if (!result.ok) failed += 1
  }

  if (failed > 0) {
    console.error(`[verify-gltf-bundle] ${failed} dependency failed`)
    process.exit(1)
  }

  console.info(`[verify-gltf-bundle] all ${results.length} dependencies OK`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
