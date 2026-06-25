import type { PrismaClient } from '@prisma/client'

import { isVariantColorAllowedForProductType } from '../src/config/catalog-colors'

import type { CanonicalProductSeed } from './seed-canonical-products.data'
import { variantMatrixKey } from './seed-canonical-variants'

export type NonCanonicalVariantRow = {
  variantId: string
  sku: string
  colorSlug: string
  sizeSlug: string
  cartItemCount: number
}

export type CanonicalVariantRemediationResult = {
  productSlug: string
  softDeleted: NonCanonicalVariantRow[]
  cartRowsDeleted: number
}

function buildAllowedMatrixKeys(product: CanonicalProductSeed): Set<string> {
  return new Set(
    product.variants.map((variant) => variantMatrixKey(variant.colorSlug, variant.sizeSlug)),
  )
}

/**
 * Returns active DB variants that are outside the canonical seed matrix for this product.
 */
export function findNonCanonicalActiveVariantKeys(
  product: CanonicalProductSeed,
  activeVariants: ReadonlyArray<{ colorSlug: string; sizeSlug: string }>,
): string[] {
  const allowed = buildAllowedMatrixKeys(product)
  return activeVariants
    .filter((variant) => !allowed.has(variantMatrixKey(variant.colorSlug, variant.sizeSlug)))
    .map((variant) => variantMatrixKey(variant.colorSlug, variant.sizeSlug))
}

/**
 * Soft-deletes active variants outside the canonical matrix. Removes disposable cart rows only.
 * Does not hard-delete variants or touch order history.
 */
export async function remediateCanonicalProductVariants(
  prisma: PrismaClient,
  productId: string,
  product: CanonicalProductSeed,
): Promise<CanonicalVariantRemediationResult> {
  const allowedKeys = buildAllowedMatrixKeys(product)

  const activeVariants = await prisma.productVariant.findMany({
    where: { productId, deletedAt: null },
    include: {
      color: true,
      size: true,
      _count: { select: { cartItems: true } },
    },
  })

  const toSoftDelete = activeVariants.filter(
    (variant) => !allowedKeys.has(variantMatrixKey(variant.color.slug, variant.size.slug)),
  )

  if (toSoftDelete.length === 0) {
    return { productSlug: product.slug, softDeleted: [], cartRowsDeleted: 0 }
  }

  const variantIds = toSoftDelete.map((variant) => variant.id)
  const cartDelete = await prisma.cartItem.deleteMany({
    where: { productVariantId: { in: variantIds } },
  })

  const deletedAt = new Date()
  await prisma.productVariant.updateMany({
    where: { id: { in: variantIds } },
    data: { deletedAt },
  })

  return {
    productSlug: product.slug,
    softDeleted: toSoftDelete.map((variant) => ({
      variantId: variant.id,
      sku: variant.sku,
      colorSlug: variant.color.slug,
      sizeSlug: variant.size.slug,
      cartItemCount: variant._count.cartItems,
    })),
    cartRowsDeleted: cartDelete.count,
  }
}

/** Validates non-deleted seed matrix colors against product type rules (for tests). */
export function canonicalSeedVariantColorsAllowed(product: CanonicalProductSeed): boolean {
  return product.variants.every((variant) =>
    isVariantColorAllowedForProductType({
      productTypeSlug: product.typeSlug,
      colorSlug: variant.colorSlug,
    }),
  )
}
