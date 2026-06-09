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
import { buildPublicR2ObjectUrl, STATIC_CACHE_CONTROL } from './public-images.shared'

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
    const body = await fs.readFile(localPath)
    await client.send(
      new PutObjectCommand({
        Bucket: env.bucketName,
        Key: file.r2Key,
        Body: body,
        ContentType: file.contentType,
        CacheControl: STATIC_CACHE_CONTROL,
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
