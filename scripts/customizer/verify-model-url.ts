/**
 * Verifies a remote customizer model URL is reachable with correct headers.
 *
 * Usage:
 *   pnpm customizer:verify-model-url -- <url>
 *   MODEL_URL=https://... pnpm customizer:verify-model-url
 */
const DEFAULT_CONTENT_TYPES = new Set([
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
])

function parseModelUrl(argv: string[]): string {
  const fromEnv = process.env.MODEL_URL?.trim()
  if (fromEnv) return fromEnv

  const index = argv.indexOf('--')
  const args = index >= 0 ? argv.slice(index + 1) : argv.slice(2)
  const url = args[0]?.trim()
  if (!url) {
    throw new Error('Provide MODEL_URL env or: pnpm customizer:verify-model-url -- <url>')
  }
  return url
}

async function main() {
  const modelUrl = parseModelUrl(process.argv)
  console.info(`[verify-model-url] HEAD ${modelUrl}`)

  const head = await fetch(modelUrl, { method: 'HEAD' })
  const contentType = head.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? ''
  const contentLength = Number(head.headers.get('content-length') ?? 0)

  const checks = {
    status200: head.status === 200,
    contentTypeOk: DEFAULT_CONTENT_TYPES.has(contentType),
    contentLengthOk: contentLength > 0,
  }

  console.info(`status: ${head.status}`)
  console.info(`content-type: ${contentType || '(missing)'}`)
  console.info(`content-length: ${contentLength}`)

  if (!checks.status200) {
    const get = await fetch(modelUrl, { method: 'GET' })
    console.info(`GET fallback status: ${get.status}`)
    if (!get.ok) {
      throw new Error(`Model URL not reachable (HEAD ${head.status}, GET ${get.status})`)
    }
    const bytes = Number(get.headers.get('content-length') ?? 0)
    if (bytes <= 0) {
      const buffer = await get.arrayBuffer()
      if (buffer.byteLength <= 0) {
        throw new Error('Model response body is empty')
      }
      console.info(`GET body bytes: ${buffer.byteLength}`)
    }
  }

  if (!checks.contentTypeOk) {
    console.warn(
      `Warning: unexpected content-type "${contentType}" (expected model/gltf-binary)`,
    )
  }

  if (!checks.contentLengthOk && checks.status200) {
    const get = await fetch(modelUrl, { method: 'GET' })
    const buffer = await get.arrayBuffer()
    if (buffer.byteLength <= 0) {
      throw new Error('Model file appears empty')
    }
    console.info(`GET body bytes: ${buffer.byteLength}`)
  }

  console.info('[verify-model-url] OK')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
