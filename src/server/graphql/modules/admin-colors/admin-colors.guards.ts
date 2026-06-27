import { ProductStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'

export type ColorVariantUsage = {
  variantId: string
  productId: string
  productName: string
  sku: string
}

export async function findActiveVariantUsageForColor(
  context: GraphQLContext,
  colorId: string,
): Promise<ColorVariantUsage[]> {
  const variants = await context.prisma.productVariant.findMany({
    where: {
      colorId,
      deletedAt: null,
      product: {
        deletedAt: null,
        status: ProductStatus.ACTIVE,
      },
    },
    select: {
      id: true,
      sku: true,
      productId: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    take: 5,
  })

  return variants.map((variant) => ({
    variantId: variant.id,
    productId: variant.productId,
    productName: variant.product.name,
    sku: variant.sku,
  }))
}

export async function assertCanArchiveColor(
  context: GraphQLContext,
  colorId: string,
): Promise<void> {
  const usage = await findActiveVariantUsageForColor(context, colorId)
  if (usage.length === 0) return

  const sample = usage[0]!
  throw new GraphQLError(
    `No se puede desactivar el color porque está en uso por variantes activas (p. ej. ${sample.productName}, SKU ${sample.sku}).`,
    {
      extensions: {
        code: 'CONFLICT',
        variantUsage: usage,
      },
    },
  )
}
