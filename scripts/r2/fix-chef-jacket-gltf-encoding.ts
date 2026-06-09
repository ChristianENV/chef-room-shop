/**
 * Re-uploads chef-jacket.gltf as UTF-8 when the R2 object was saved as UTF-16 (Windows BOM).
 *
 * Usage: pnpm exec tsx scripts/r2/fix-chef-jacket-gltf-encoding.ts
 */
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { buildPublicR2ObjectUrl, MODEL_GLTF_CACHE_CONTROL } from './public-images.shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')

const R2_KEY = 'public/images/models/customizer/chef-jacket/chef-jacket.gltf'

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

function toUtf8GltfBuffer(raw: Buffer): { body: Buffer; converted: boolean; encoding: string } {
  if (raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe) {
    const text = raw.toString('utf16le').replace(/^\uFEFF/, '')
    JSON.parse(text)
    return { body: Buffer.from(text, 'utf8'), converted: true, encoding: 'utf-16le' }
  }

  if (raw.length >= 3 && raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    const text = raw.toString('utf8').replace(/^\uFEFF/, '')
    JSON.parse(text)
    return { body: Buffer.from(text, 'utf8'), converted: false, encoding: 'utf-8-bom' }
  }

  const text = raw.toString('utf8')
  JSON.parse(text)
  return { body: Buffer.from(text, 'utf8'), converted: false, encoding: 'utf-8' }
}

async function main() {
  const force = process.argv.includes('--force')
  const env = readR2Env()
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  })

  const existing = await client.send(
    new GetObjectCommand({
      Bucket: env.bucketName,
      Key: R2_KEY,
    }),
  )

  const raw = Buffer.from(await existing.Body!.transformToByteArray())
  const { body, converted, encoding } = toUtf8GltfBuffer(raw)

  console.log(`Detected encoding: ${encoding}`)
  console.log(`Size before: ${raw.length} bytes`)
  console.log(`Size after:  ${body.length} bytes`)

  if (!converted && encoding === 'utf-8' && !force) {
    console.log('Already UTF-8 JSON. No upload needed. Pass --force to refresh cache headers.')
    return
  }

  await client.send(
    new PutObjectCommand({
      Bucket: env.bucketName,
      Key: R2_KEY,
      Body: body,
      ContentType: 'model/gltf+json; charset=utf-8',
      CacheControl: MODEL_GLTF_CACHE_CONTROL,
    }),
  )

  console.log(`Fixed and uploaded: ${buildPublicR2ObjectUrl(env.publicBaseUrl, R2_KEY)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
