import type { PrismaClient } from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  isValidVariantColorRecord,
  isVariantColorEligibleForProductType,
  type VariantColorEligibilityInput,
} from '@/src/config/variant-color-eligibility'
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

export function toVariantColorEligibilityInput(color: {
  slug: string
  name: string
  hex: string
  isFabricColor: boolean
  isProductColor: boolean
  isActive: boolean
}): VariantColorEligibilityInput {
  return {
    slug: color.slug,
    name: color.name,
    hexCode: color.hex,
    isFabricColor: color.isFabricColor,
    isProductColor: color.isProductColor,
    isActive: color.isActive,
  }
}

/**
 * Ensures a color is allowed for the product type (sellable variant rules).
 */
export function assertVariantColorAllowedForProductType(params: {
  productTypeSlug: string
  color: VariantColorEligibilityInput
}): void {
  if (!isValidVariantColorRecord(params.color)) {
    throw badUserInputError(VARIANT_COLOR_UNKNOWN_MESSAGE, {
      colorSlug: params.color.slug.trim().toLowerCase(),
    })
  }

  if (
    !isVariantColorEligibleForProductType({
      productTypeSlug: params.productTypeSlug,
      color: params.color,
    })
  ) {
    throw badUserInputError(VARIANT_COLOR_NOT_ALLOWED_MESSAGE, {
      productTypeSlug: params.productTypeSlug.trim().toLowerCase(),
      colorSlug: params.color.slug.trim().toLowerCase(),
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
    .filter(
      (variant) =>
        !isVariantColorEligibleForProductType({
          productTypeSlug,
          color: toVariantColorEligibilityInput(variant.color),
        }),
    )
    .map((variant) => variant.color.slug)

  if (invalidSlugs.length > 0) {
    throw badUserInputError(PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE, {
      productTypeSlug: productTypeSlug.trim().toLowerCase(),
      invalidColorSlugs: [...new Set(invalidSlugs)],
    })
  }
}
