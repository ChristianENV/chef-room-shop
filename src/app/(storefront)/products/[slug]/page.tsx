import type { Metadata } from 'next'

import { ProductPageClient } from './product-page-client'
import { buildProductPageMetadata } from '@/src/features/storefront/products/lib/product-page-metadata'
import { prisma } from '@/src/server/db/prisma'
import { getProductBySlug } from '@/src/server/graphql/modules/catalog/catalog.service'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(prisma, slug)

  if (!product) {
    return { title: 'Producto no encontrado' }
  }

  return buildProductPageMetadata({
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoImageId: product.seoImageId,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder ?? 0,
    })),
  })
}

export default function ProductPage() {
  return <ProductPageClient />
}
