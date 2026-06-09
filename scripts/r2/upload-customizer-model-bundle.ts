/**
 * Upload chef-jacket glTF bundle (.gltf + .bin) to R2 alongside existing textures.
 *
 * Usage: pnpm r2:customizer-model:upload
 */
import { config as loadEnv } from 'dotenv'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { buildPublicR2ObjectUrl, MODEL_GLTF_CACHE_CONTROL, STATIC_CACHE_CONTROL } from './public-images.shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const MODEL_DIR = path.join(REPO_ROOT, 'public/models/customizer/chef-jacket')

const BUNDLE_FILES = [
  {
    fileName: 'chef-jacket.gltf',
    r2Key: 'public/images/models/customizer/chef-jacket/chef-jacket.gltf',
    contentType: 'model/gltf+json',
  },
  {
    fileName: 'chef-jacket.bin',
    r2Key: 'public/images/models/customizer/chef-jacket/chef-jacket.bin',
    contentType: 'application/octet-stream',
  },
] as const

loadEnv({ path: path.join(REPO_ROOT, '.env.local') })
loadEnv({ path: path.join(REPO_ROOT, '.env') })

/** glTF must be UTF-8 JSON; Windows editors sometimes save UTF-16 with BOM. */
function normalizeGltfToUtf8(raw: Buffer): Buffer {
  if (raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe) {
    const text = raw.toString('utf16le').replace(/^\uFEFF/, '')
    return Buffer.from(text, 'utf8')
  }
  if (raw.length >= 3 && raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    return Buffer.from(raw.toString('utf8').replace(/^\uFEFF/, ''), 'utf8')
  }
  return raw
}

function readR2Env() {
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
    ['R2_PUBLIC_BASE_URL', publicBaseUrl],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length > 0) {
    throw new Error(`Missing R2 env: ${missing.join(', ')}`)
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicBaseUrl }
}

async function main() {
  const env = readR2Env()
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  })

  console.log('Uploading customizer model bundle to R2...\n')

  for (const file of BUNDLE_FILES) {
    const localPath = path.join(MODEL_DIR, file.fileName)
    const raw = await fs.readFile(localPath)
    const body =
      file.fileName.endsWith('.gltf') ? normalizeGltfToUtf8(raw) : raw
    await client.send(
      new PutObjectCommand({
        Bucket: env.bucketName,
        Key: file.r2Key,
        Body: body,
        ContentType:
          file.fileName.endsWith('.gltf')
            ? 'model/gltf+json; charset=utf-8'
            : file.contentType,
        CacheControl: file.fileName.endsWith('.gltf')
          ? MODEL_GLTF_CACHE_CONTROL
          : STATIC_CACHE_CONTROL,
      }),
    )
    const url = buildPublicR2ObjectUrl(env.publicBaseUrl, file.r2Key)
    console.log(`uploaded ${file.fileName}`)
    console.log(`  ${url}\n`)
  }

  console.log('Done.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
