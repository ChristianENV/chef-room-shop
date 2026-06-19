/**
 * Upload storefront static images from `/public` to Cloudflare R2.
 *
 * Scope (included):
 * - `public/images/**` (landing, logos except favicon-named files, etc.)
 * - image files under `public/models/**` (textures only; GLTF/GLB/BIN stay local)
 *
 * Excluded: favicon/PWA/browser icons, root `icon*.svg/png`, web-app-manifest PNGs.
 *
 * Usage:
 *   pnpm r2:public-images:dry-run
 *   pnpm r2:public-images:upload
 */
import { config as loadEnv } from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  buildPublicR2ObjectUrl,
  contentTypeForExtension,
  getExcludeReason,
  mapPublicFileToR2Key,
  shouldExcludePublicImage,
  STATIC_CACHE_CONTROL,
  toManifestLocalPath,
} from './public-images.shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const PUBLIC_DIR = path.join(REPO_ROOT, 'public')
const MANIFEST_PATH = path.join(REPO_ROOT, 'src/generated/r2-public-images.manifest.json')
const REPORT_PATH = path.join(REPO_ROOT, 'docs/r2-public-images-upload-report.md')

loadEnv({ path: path.join(REPO_ROOT, '.env.local') })
loadEnv({ path: path.join(REPO_ROOT, '.env') })

type R2Env = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicBaseUrl: string
  region: string
}

type CandidateFile = {
  absolutePath: string
  relativeFromPublic: string
  r2Key: string
  localPath: string
  publicDiskPath: string
  fileName: string
  sizeBytes: number
}

type UploadRow = {
  fileName: string
  publicDiskPath: string
  localPath: string
  r2Key: string
  cloudflareUrl: string
  status: 'uploaded' | 'replaced' | 'skipped'
}

type CliMode = 'dry-run' | 'upload'

function parseArgs(): { mode: CliMode; force: boolean } {
  const args = process.argv.slice(2)
  if (args.includes('--dry-run')) {
    return { mode: 'dry-run', force: false }
  }
  if (args.includes('--upload') || process.env.R2_PUBLIC_IMAGES_MODE === 'upload') {
    return { mode: 'upload', force: args.includes('--force') }
  }
  return { mode: 'dry-run', force: false }
}

function readR2Env(): R2Env {
  const read = (name: string) => process.env[name]?.trim() ?? ''
  const accountId = read('R2_ACCOUNT_ID')
  const accessKeyId = read('R2_ACCESS_KEY_ID')
  const secretAccessKey = read('R2_SECRET_ACCESS_KEY')
  const bucketName = read('R2_BUCKET_NAME')
  const publicBaseUrl = (
    read('R2_PUBLIC_BASE_URL') || read('NEXT_PUBLIC_R2_PUBLIC_BASE_URL')
  ).replace(/\/+$/, '')

  const missing = [
    ['R2_ACCOUNT_ID', accountId],
    ['R2_ACCESS_KEY_ID', accessKeyId],
    ['R2_SECRET_ACCESS_KEY', secretAccessKey],
    ['R2_BUCKET_NAME', bucketName],
    ['R2_PUBLIC_BASE_URL or NEXT_PUBLIC_R2_PUBLIC_BASE_URL', publicBaseUrl],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length > 0) {
    throw new Error(
      `Missing required R2 environment variables: ${missing.join(', ')}\n` +
        'Add them to .env.local (see docs/configuration.md → Storage R2) and re-run.\n' +
        'Dry-run does not need credentials: pnpm r2:public-images:dry-run',
    )
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl,
    region: read('R2_REGION') || 'auto',
  }
}

function createR2Client(env: R2Env): S3Client {
  return new S3Client({
    region: env.region,
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  })
}

async function walkPublicDir(dir: string, base = ''): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const relative = base ? `${base}/${entry.name}` : entry.name
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkPublicDir(absolute, relative)))
    } else if (entry.isFile()) {
      files.push(relative)
    }
  }

  return files
}

async function collectCandidates(): Promise<{
  candidates: CandidateFile[]
  excluded: Array<{ relativeFromPublic: string; reason: string }>
}> {
  const allFiles = await walkPublicDir(PUBLIC_DIR)
  const candidates: CandidateFile[] = []
  const excluded: Array<{ relativeFromPublic: string; reason: string }> = []
  const keyOwners = new Map<string, string>()

  for (const relativeFromPublic of allFiles) {
    if (shouldExcludePublicImage(relativeFromPublic)) {
      excluded.push({
        relativeFromPublic,
        reason: getExcludeReason(relativeFromPublic),
      })
      continue
    }

    const r2Key = mapPublicFileToR2Key(relativeFromPublic)
    const previousOwner = keyOwners.get(r2Key)
    if (previousOwner && previousOwner !== relativeFromPublic) {
      throw new Error(
        `R2 key collision: "${r2Key}" would be written by both "${previousOwner}" and "${relativeFromPublic}"`,
      )
    }
    keyOwners.set(r2Key, relativeFromPublic)

    const absolutePath = path.join(PUBLIC_DIR, relativeFromPublic)
    const stat = await fs.stat(absolutePath)
    candidates.push({
      absolutePath,
      relativeFromPublic,
      r2Key,
      localPath: toManifestLocalPath(relativeFromPublic),
      publicDiskPath: `public/${relativeFromPublic.replace(/\\/g, '/')}`,
      fileName: path.basename(relativeFromPublic),
      sizeBytes: stat.size,
    })
  }

  candidates.sort((a, b) => a.relativeFromPublic.localeCompare(b.relativeFromPublic))
  excluded.sort((a, b) => a.relativeFromPublic.localeCompare(b.relativeFromPublic))
  return { candidates, excluded }
}

async function objectExists(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (error) {
    const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } }
    if (candidate.name === 'NotFound' || candidate.$metadata?.httpStatusCode === 404) {
      return false
    }
    throw error
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, '\\|')
}

function buildUploadTable(rows: UploadRow[]): string {
  const header = '| File | Local Path | R2 Key | Cloudflare URL | Status |'
  const divider = '|---|---|---|---|---|'
  const body = rows
    .map((row) =>
      [
        escapeMarkdownCell(row.fileName),
        escapeMarkdownCell(row.publicDiskPath),
        escapeMarkdownCell(row.r2Key),
        escapeMarkdownCell(row.cloudflareUrl),
        row.status,
      ].join(' | '),
    )
    .map((line) => `| ${line} |`)
    .join('\n')
  return `${header}\n${divider}\n${body}`
}

function buildExcludedTable(
  excluded: Array<{ relativeFromPublic: string; reason: string }>,
): string {
  const header = '| File | Reason |'
  const divider = '|---|---|'
  const body = excluded
    .map((row) => {
      const file = escapeMarkdownCell(path.posix.basename(row.relativeFromPublic))
      const diskPath = escapeMarkdownCell(`public/${row.relativeFromPublic.replace(/\\/g, '/')}`)
      return `| ${file} (${diskPath}) | ${escapeMarkdownCell(row.reason)} |`
    })
    .join('\n')
  return `${header}\n${divider}\n${body}`
}

async function writeManifest(entries: Record<string, string>): Promise<void> {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true })
  const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)))
  await fs.writeFile(`${MANIFEST_PATH}`, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
}

async function writeReport(options: {
  rows: UploadRow[]
  excluded: Array<{ relativeFromPublic: string; reason: string }>
  mode: CliMode
  publicBaseUrl: string
}): Promise<void> {
  const generatedAt = new Date().toISOString()
  const content = `# R2 Public Images Upload Report

Generated: ${generatedAt}
Mode: ${options.mode}
Public base URL: ${options.publicBaseUrl}

## R2 Upload Summary

${buildUploadTable(options.rows)}

## Excluded Files

${buildExcludedTable(options.excluded)}

## Code References Updated

| File | What Changed |
|---|---|
| \`src/features/storefront/landing/lib/landing-media.ts\` | All landing slots resolve via \`getPublicImageUrl()\` |
| \`src/features/storefront/landing/components/landing-media-image.tsx\` | Consumes resolved \`asset.src\` from \`LANDING_MEDIA\` |
| \`src/features/storefront/landing/components/chef-avatar-stack.tsx\` | Uses \`LANDING_CHEF_AVATARS\` (resolved URLs) |
| \`src/config/public-images.ts\` | Manifest lookup + local fallback |
| \`next.config.mjs\` | \`images.remotePatterns\` for R2 public hostname |

## Manual Review

| Path | Reason |
|---|---|
| \`/models/customizer/chef-jacket/chef-jacket.gltf\` | GLTF bundle stays local; relative texture paths unchanged |
| \`src/features/storefront/customizer/3d/model-registry.ts\` | Model URL unchanged for 3D customizer |
| \`src/features/storefront/landing/featured-products.tsx\` | Product images come from catalog BFF, not static manifest |
| \`src/app/layout.tsx\` | Favicon/app icons remain local |
`

  await fs.writeFile(REPORT_PATH, content, 'utf8')
}

async function main(): Promise<void> {
  const { mode, force } = parseArgs()
  const { candidates, excluded } = await collectCandidates()

  console.log(
    `\nChef Room — R2 public images (${mode}${mode === 'upload' && force ? ', force' : ''})\n`,
  )
  console.log(
    `Found ${candidates.length} upload candidate(s), excluded ${excluded.length} file(s).\n`,
  )

  if (candidates.length === 0) {
    console.log('Nothing to upload.')
    return
  }

  if (mode === 'dry-run') {
    if (excluded.length > 0) {
      console.log('Excluded (local only):')
      for (const file of excluded) {
        console.log(`  - public/${file.relativeFromPublic} (${file.reason})`)
      }
      console.log('')
    }

    console.log('local path → R2 key (size)')
    for (const file of candidates) {
      console.log(`  ${file.localPath} → ${file.r2Key} (${formatBytes(file.sizeBytes)})`)
    }
    console.log('\nDry run complete. Run `pnpm r2:public-images:upload` to upload.')
    return
  }

  const env = readR2Env()
  const client = createR2Client(env)
  const manifest: Record<string, string> = {}
  const rows: UploadRow[] = []

  let uploaded = 0
  let replaced = 0
  let skipped = 0

  for (const file of candidates) {
    const cloudflareUrl = buildPublicR2ObjectUrl(env.publicBaseUrl, file.r2Key)
    const exists = await objectExists(client, env.bucketName, file.r2Key)

    if (exists && !force) {
      skipped += 1
      rows.push({
        fileName: file.fileName,
        publicDiskPath: file.publicDiskPath,
        localPath: file.localPath,
        r2Key: file.r2Key,
        cloudflareUrl,
        status: 'skipped',
      })
      console.log(`skip  ${file.localPath} (exists)`)
    } else {
      const body = await fs.readFile(file.absolutePath)
      const ext = path.extname(file.relativeFromPublic)
      await client.send(
        new PutObjectCommand({
          Bucket: env.bucketName,
          Key: file.r2Key,
          Body: body,
          ContentType: contentTypeForExtension(ext),
          CacheControl: STATIC_CACHE_CONTROL,
        }),
      )

      const status = exists ? 'replaced' : 'uploaded'
      if (status === 'replaced') replaced += 1
      else uploaded += 1

      rows.push({
        fileName: file.fileName,
        publicDiskPath: file.publicDiskPath,
        localPath: file.localPath,
        r2Key: file.r2Key,
        cloudflareUrl,
        status,
      })
      console.log(`${status} ${file.localPath} → ${cloudflareUrl}`)
    }

    manifest[file.localPath] = cloudflareUrl
  }

  await writeManifest(manifest)
  await writeReport({ rows, excluded, mode, publicBaseUrl: env.publicBaseUrl })

  console.log('\n## R2 Upload Summary\n')
  console.log(buildUploadTable(rows))
  console.log(
    `\nDone. uploaded=${uploaded} replaced=${replaced} skipped=${skipped} manifest=${path.relative(REPO_ROOT, MANIFEST_PATH)} report=${path.relative(REPO_ROOT, REPORT_PATH)}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
