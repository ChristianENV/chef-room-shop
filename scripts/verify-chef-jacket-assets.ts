/**
 * Verifies local chef-jacket bundle assets are served with HTTP 200.
 *
 * Usage:
 *   pnpm customizer:verify-assets
 *   pnpm customizer:verify-assets -- --base http://localhost:3000
 */
import { CHEF_JACKET_SMOKE_ASSET_PATHS } from '../src/features/storefront/customizer/3d/chef-jacket-smoke-config'

const DEFAULT_BASE = process.env.CUSTOMIZER_ASSET_BASE_URL ?? 'http://localhost:3000'

function parseBaseUrl(argv: string[]): string {
  const index = argv.indexOf('--base')
  if (index >= 0 && argv[index + 1]) return argv[index + 1].replace(/\/$/, '')
  return DEFAULT_BASE.replace(/\/$/, '')
}

function resolveAssetUrl(baseUrl: string, path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${baseUrl}${path}`
}

async function checkAsset(baseUrl: string, path: string) {
  const url = resolveAssetUrl(baseUrl, path)
  const response = await fetch(url, { method: 'GET' })
  const contentType = response.headers.get('content-type') ?? '(missing)'
  return {
    path,
    url,
    status: response.status,
    ok: response.ok,
    contentType,
    bytes: response.ok ? Number(response.headers.get('content-length') ?? 0) : 0,
  }
}

async function main() {
  const baseUrl = parseBaseUrl(process.argv.slice(2))
  console.info(`[verify-chef-jacket-assets] base=${baseUrl}`)

  const results = await Promise.all(
    CHEF_JACKET_SMOKE_ASSET_PATHS.map((path) => checkAsset(baseUrl, path)),
  )

  let failed = 0
  for (const result of results) {
    const mark = result.ok ? 'OK' : 'FAIL'
    console.info(
      `${mark} ${result.status} ${result.path} content-type=${result.contentType}`,
    )
    if (!result.ok) failed += 1
  }

  if (failed > 0) {
    console.error(`[verify-chef-jacket-assets] ${failed} asset(s) failed`)
    process.exit(1)
  }

  console.info('[verify-chef-jacket-assets] all assets OK')
}

main().catch((error) => {
  console.error('[verify-chef-jacket-assets] fatal', error)
  process.exit(1)
})
