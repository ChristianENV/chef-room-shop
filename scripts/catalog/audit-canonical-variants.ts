/**
 * Read-only audit: canonical product variants vs seed matrix.
 * Safe for any environment (no mutations).
 */
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

import { createPrismaClient } from '../../src/server/db/create-prisma'
import { isVariantColorAllowedForProductType } from '../../src/config/catalog-colors'
import { CANONICAL_PRODUCTS } from '../../prisma/seed-canonical-products.data'
import { findNonCanonicalActiveVariantKeys } from '../../prisma/seed-canonical-variant-remediation'
import { variantMatrixKey } from '../../prisma/seed-canonical-variants'

const prisma = createPrismaClient()

async function countOrderItemsForProduct(productId: string, slug: string): Promise<number> {
  const items = await prisma.orderItem.findMany({ select: { productSnapshotJson: true } })
  let count = 0
  for (const item of items) {
    const snapshot = item.productSnapshotJson as { productId?: string; slug?: string } | null
    if (!snapshot) continue
    if (snapshot.productId === productId || snapshot.slug === slug) count += 1
  }
  return count
}

async function main() {
  const rows: unknown[] = []

  for (const seed of CANONICAL_PRODUCTS) {
    const product = await prisma.product.findUnique({
      where: { slug: seed.slug },
      include: {
        productType: true,
        variants: {
          include: {
            color: true,
            size: true,
            _count: { select: { cartItems: true } },
          },
        },
      },
    })

    if (!product) {
      rows.push({ slug: seed.slug, error: 'product not found' })
      continue
    }

    const activeVariants = product.variants.filter((variant) => variant.deletedAt === null)
    const nonCanonicalKeys = findNonCanonicalActiveVariantKeys(
      seed,
      activeVariants.map((variant) => ({
        colorSlug: variant.color.slug,
        sizeSlug: variant.size.slug,
      })),
    )

    rows.push({
      slug: seed.slug,
      productTypeSlug: product.productType.slug,
      expectedNonDeletedVariants: seed.variants.length,
      actualNonDeletedVariants: activeVariants.length,
      nonCanonicalActiveCount: nonCanonicalKeys.length,
      nonCanonicalKeys,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        colorSlug: variant.color.slug,
        sizeSlug: variant.size.slug,
        deletedAt: variant.deletedAt?.toISOString() ?? null,
        stockQty: variant.stockQty,
        priceCents: variant.priceCents,
        colorAllowedForType: isVariantColorAllowedForProductType({
          productTypeSlug: product.productType.slug,
          colorSlug: variant.color.slug,
        }),
        inCanonicalMatrix: seed.variants.some(
          (seedVariant) =>
            variantMatrixKey(seedVariant.colorSlug, seedVariant.sizeSlug) ===
            variantMatrixKey(variant.color.slug, variant.size.slug),
        ),
        cartItemCount: variant._count.cartItems,
      })),
      productOrderItemCount: await countOrderItemsForProduct(product.id, product.slug),
    })
  }

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
