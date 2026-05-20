import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { PRODUCT_BY_SLUG_QUERY } from '../graphql/product.queries'
import type { ProductBySlugQueryData, ProductDetail } from '../types'

/**
 * Fetches a single product by slug from the catalog BFF.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const data = await fetchGraphQL<ProductBySlugQueryData, { slug: string }>({
    query: PRODUCT_BY_SLUG_QUERY,
    variables: { slug },
  })

  return data.productBySlug
}
