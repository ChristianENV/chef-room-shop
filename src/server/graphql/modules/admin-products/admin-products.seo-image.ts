import { GraphQLError } from 'graphql'

import type { PrismaClient } from '@prisma/client'

export { resolveProductOgImageUrl, type ProductImageRef } from '@/src/lib/product-seo-image'

/**
 * Ensures a SEO image id belongs to the given product.
 */
export async function assertSeoImageBelongsToProduct(
  prisma: Pick<PrismaClient, 'productImage'>,
  productId: string,
  seoImageId: string,
): Promise<void> {
  const image = await prisma.productImage.findFirst({
    where: { id: seoImageId, productId },
    select: { id: true },
  })

  if (!image) {
    throw new GraphQLError('La imagen SEO debe ser una foto existente de este producto.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }
}
