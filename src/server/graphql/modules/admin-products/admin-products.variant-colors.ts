import type { PrismaClient } from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  isKnownCatalogColorSlug,
  isVariantColorAllowedForProductType,
} from '@/src/config/catalog-colors'
import {
  PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE,
  VARIANT_COLOR_NOT_ALLOWED_MESSAGE,
  VARIANT_COLOR_UNKNOWN_MESSAGE,
} from '@/src/config/catalog-color-messages'

function badUserInputError(
  message: string,
  details?: Record<string, string | string[]>,
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      ...details,
    },
  })
}

/**
 * Ensures a color slug is allowed for the product type (sellable variant rules).
 */
export function assertVariantColorAllowedForProductType(params: {
  productTypeSlug: string
  colorSlug: string
}): void {
  const colorSlug = params.colorSlug.trim().toLowerCase()

  if (!isKnownCatalogColorSlug(colorSlug)) {
    throw badUserInputError(VARIANT_COLOR_UNKNOWN_MESSAGE, { colorSlug })
  }

  if (
    !isVariantColorAllowedForProductType({
      productTypeSlug: params.productTypeSlug,
      colorSlug,
    })
  ) {
    throw badUserInputError(VARIANT_COLOR_NOT_ALLOWED_MESSAGE, {
      productTypeSlug: params.productTypeSlug.trim().toLowerCase(),
      colorSlug,
    })
  }
}

/**
 * Blocks product type changes when active variants use colors outside the new type rules.
 */
export async function assertActiveVariantsMatchProductType(
  prisma: Pick<PrismaClient, 'productVariant'>,
  productId: string,
  productTypeSlug: string,
): Promise<void> {
  const variants = await prisma.productVariant.findMany({
    where: { productId, deletedAt: null },
    include: { color: true },
  })

  const invalidSlugs = variants
    .map((variant) => variant.color.slug)
    .filter(
      (colorSlug) =>
        !isVariantColorAllowedForProductType({
          productTypeSlug,
          colorSlug,
        }),
    )

  if (invalidSlugs.length > 0) {
    throw badUserInputError(PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE, {
      productTypeSlug: productTypeSlug.trim().toLowerCase(),
      invalidColorSlugs: [...new Set(invalidSlugs)],
    })
  }
}
