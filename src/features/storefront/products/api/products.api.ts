import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  CUSTOMIZATION_RULES_BY_PRODUCT_QUERY,
  PRODUCT_BY_SLUG_QUERY,
} from '../graphql/product.queries'
import type {
  CustomizationRulesByProductQueryData,
  ProductBySlugQueryData,
  ProductCustomizationRule,
  ProductDetail,
} from '../types'

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

/**
 * Fetches customization rules by product id from the catalog BFF.
 */
export async function getCustomizationRulesByProduct(
  productId: string,
): Promise<ProductCustomizationRule[]> {
  const data = await fetchGraphQL<
    CustomizationRulesByProductQueryData,
    { productId: string }
  >({
    query: CUSTOMIZATION_RULES_BY_PRODUCT_QUERY,
    variables: { productId },
  })

  return data.customizationRulesByProduct
}
