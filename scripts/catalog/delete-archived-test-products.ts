/**
 * One-time hard-delete of archived/test products by explicit slug allowlist.
 * Refuses production. Blocks products with order history.
 */
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

import { ProductStatus, type PrismaClient } from '@prisma/client'

import { createPrismaClient } from '../../src/server/db/create-prisma'
import { assertNonProductionDatabase } from './assert-non-production-db'

/** Explicit allowlist — never delete by status/pattern/category alone. */
export const ARCHIVED_TEST_PRODUCT_SLUGS = [
  'demo-filipina-clasica',
  'demo-filipina-manga-corta-premium',
  'demo-mandil-denim-ejecutivo',
  'demo-pantalon-chef-slim-gris',
  'filipina-prueba',
  'filipina-prueba-copia',
] as const

type DeletionReport = {
  deleted: Array<{
    slug: string
    productId: string
    variantsDeleted: number
    imagesDeleted: number
    rulesDeleted: number
    modelAssetsDeleted: number
    cartRowsDeleted: number
  }>
  blocked: Array<{ slug: string; reason: string }>
  skipped: Array<{ slug: string; reason: string }>
}

async function countOrderItemsForProduct(
  prisma: PrismaClient,
  product: { id: string; slug: string },
): Promise<number> {
  const items = await prisma.orderItem.findMany({
    select: { productSnapshotJson: true },
  })

  let count = 0
  for (const item of items) {
    const snapshot = item.productSnapshotJson as { productId?: string; slug?: string } | null
    if (!snapshot) continue
    if (snapshot.productId === product.id || snapshot.slug === product.slug) {
      count += 1
    }
  }
  return count
}

function isArchivedOrTestProduct(status: ProductStatus, deletedAt: Date | null): boolean {
  return status === ProductStatus.ARCHIVED || deletedAt != null
}

export async function deleteArchivedTestProducts(
  prisma: PrismaClient,
  slugs: readonly string[] = ARCHIVED_TEST_PRODUCT_SLUGS,
): Promise<DeletionReport> {
  const report: DeletionReport = { deleted: [], blocked: [], skipped: [] }

  for (const slug of slugs) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: { where: { deletedAt: null } },
        images: true,
        customizationRules: true,
        modelAssets: true,
        _count: { select: { cartItems: true } },
      },
    })

    if (!product) {
      report.skipped.push({ slug, reason: 'product not found' })
      continue
    }

    if (!isArchivedOrTestProduct(product.status, product.deletedAt)) {
      report.blocked.push({
        slug,
        reason: `status is ${product.status} and not archived/soft-deleted`,
      })
      continue
    }

    const orderItemCount = await countOrderItemsForProduct(prisma, product)
    if (orderItemCount > 0) {
      report.blocked.push({
        slug,
        reason: `has ${orderItemCount} order item(s) in order history`,
      })
      continue
    }

    const variantIds = product.variants.map((variant) => variant.id)

    const cartRowsDeleted = await prisma.cartItem.deleteMany({
      where: {
        OR: [
          { productId: product.id },
          ...(variantIds.length > 0 ? [{ productVariantId: { in: variantIds } }] : []),
        ],
      },
    })

    await prisma.$transaction(async (tx) => {
      await tx.productCustomizationRule.deleteMany({ where: { productId: product.id } })
      await tx.productImage.deleteMany({ where: { productId: product.id } })
      await tx.productModelAsset.deleteMany({ where: { productId: product.id } })
      await tx.productVariant.deleteMany({ where: { productId: product.id } })
      await tx.product.delete({ where: { id: product.id } })
    })

    report.deleted.push({
      slug,
      productId: product.id,
      variantsDeleted: product.variants.length,
      imagesDeleted: product.images.length,
      rulesDeleted: product.customizationRules.length,
      modelAssetsDeleted: product.modelAssets.length,
      cartRowsDeleted: cartRowsDeleted.count,
    })
  }

  return report
}

import { pathToFileURL } from 'node:url'

async function main() {
  const guard = assertNonProductionDatabase()
  console.log(`Non-production guard OK (env=${guard.appEnvironment}, host=${guard.databaseHost})`)

  const prisma = createPrismaClient()
  try {
    const report = await deleteArchivedTestProducts(prisma)
    console.log(JSON.stringify(report, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isDirectRun) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
