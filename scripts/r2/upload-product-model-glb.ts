/**
 * Upload a single .glb product model to R2 and activate it in the database.
 *
 * Usage:
 *   PRODUCT_SLUG=demo-filipina-executive-blanca MODEL_FILE=.tmp/models/chef-jacket.glb pnpm r2:product-model:upload
 *
 * Requires R2 + DATABASE_URL in .env.local (same as admin upload flow).
 * Prints the public model URL only — never logs secrets.
 */
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { PrismaClient, ProductModelAssetStatus } from '@prisma/client'
import { config as loadEnv } from 'dotenv'
import { buildPublicR2ObjectUrl, STATIC_CACHE_CONTROL } from './public-images.shared'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../..')
const GLB_CONTENT_TYPE = 'model/gltf-binary'

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

function buildProductModelObjectKey(productId: string, modelAssetId: string): string {
  return `products/${productId}/models/${modelAssetId}/model.glb`
}

async function main() {
  const productSlug = process.env.PRODUCT_SLUG?.trim()
  const modelFile = process.env.MODEL_FILE?.trim()

  if (!productSlug) {
    throw new Error('Set PRODUCT_SLUG (e.g. demo-filipina-executive-blanca)')
  }
  if (!modelFile) {
    throw new Error('Set MODEL_FILE (e.g. .tmp/models/chef-jacket.glb)')
  }

  const absoluteModelPath = path.resolve(REPO_ROOT, modelFile)
  const body = await fs.readFile(absoluteModelPath)
  if (body.byteLength <= 0) {
    throw new Error(`Model file is empty: ${absoluteModelPath}`)
  }

  const env = readR2Env()
  const prisma = new PrismaClient()

  try {
    const product = await prisma.product.findFirst({
      where: { slug: productSlug, deletedAt: null },
      select: { id: true, slug: true, name: true },
    })
    if (!product) {
      throw new Error(`Product not found for slug: ${productSlug}`)
    }

    const modelAssetId = randomUUID()
    const key = buildProductModelObjectKey(product.id, modelAssetId)
    const publicUrl = buildPublicR2ObjectUrl(env.publicBaseUrl, key)
    const fileName = path.basename(absoluteModelPath)

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.accessKeyId,
        secretAccessKey: env.secretAccessKey,
      },
    })

    console.info(`Uploading ${fileName} for product "${product.slug}"...`)

    await client.send(
      new PutObjectCommand({
        Bucket: env.bucketName,
        Key: key,
        Body: body,
        ContentType: GLB_CONTENT_TYPE,
        CacheControl: STATIC_CACHE_CONTROL,
      }),
    )

    await prisma.productModelAsset.updateMany({
      where: {
        productId: product.id,
        isActive: true,
        deletedAt: null,
      },
      data: { isActive: false, status: ProductModelAssetStatus.INACTIVE },
    })

    await prisma.productModelAsset.create({
      data: {
        id: modelAssetId,
        productId: product.id,
        url: publicUrl,
        publicId: key,
        fileName,
        originalFileName: fileName,
        format: 'glb',
        contentType: GLB_CONTENT_TYPE,
        sizeBytes: body.byteLength,
        isActive: true,
        status: ProductModelAssetStatus.ACTIVE,
      },
    })

    console.info('Upload complete.')
    console.info(`productSlug: ${product.slug}`)
    console.info(`modelAssetId: ${modelAssetId}`)
    console.info(`publicUrl: ${publicUrl}`)
    console.info(`r2Key: ${key}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
