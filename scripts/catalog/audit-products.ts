/**
 * One-time audit: list all products with dependency counts.
 * Read-only. Safe to run in any environment (no mutations).
 */
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

import { createPrismaClient } from '../../src/server/db/create-prisma'

const prisma = createPrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    include: {
      productType: true,
      variants: {
        where: { deletedAt: null },
        select: { id: true, sku: true, stockQty: true, priceCents: true },
      },
      images: true,
      customizationRules: true,
      _count: {
        select: {
          variants: true,
          images: true,
          customizationRules: true,
          cartItems: true,
        },
      },
    },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  })

  const productOrderCounts = new Map<string, number>()
  for (const product of products) {
    productOrderCounts.set(product.id, 0)
  }

  const orderItems = await prisma.orderItem.findMany({
    select: { productSnapshotJson: true },
  })

  const slugSet = new Set(products.map((p) => p.slug))

  for (const item of orderItems) {
    const snapshot = item.productSnapshotJson as { productId?: string; slug?: string } | null
    if (!snapshot) continue

    if (snapshot.productId && productOrderCounts.has(snapshot.productId)) {
      productOrderCounts.set(
        snapshot.productId,
        (productOrderCounts.get(snapshot.productId) ?? 0) + 1,
      )
      continue
    }

    if (snapshot.slug && slugSet.has(snapshot.slug)) {
      const product = products.find((p) => p.slug === snapshot.slug)
      if (product) {
        productOrderCounts.set(product.id, (productOrderCounts.get(product.id) ?? 0) + 1)
      }
    }
  }

  const rows = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    productTypeSlug: product.productType.slug,
    productTypeNameEs: product.productType.nameEs,
    status: product.status,
    customizable: product.customizable,
    deletedAt: product.deletedAt?.toISOString() ?? null,
    basePriceCents: product.basePriceCents,
    variantCount: product._count.variants,
    imageCount: product._count.images,
    customizationRuleCount: product._count.customizationRules,
    orderItemCount: productOrderCounts.get(product.id) ?? 0,
    cartItemCount: product._count.cartItems,
    variantSkus: product.variants.map((v) => v.sku),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }))

  console.log(JSON.stringify(rows, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
