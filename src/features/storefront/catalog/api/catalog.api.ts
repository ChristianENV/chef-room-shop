import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  COLORS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_TYPES_QUERY,
  SIZES_QUERY,
} from '../graphql/catalog.queries'
import type {
  CatalogFilters,
  CatalogProduct,
  ColorsQueryData,
  GetCatalogProductsInput,
  ProductTypesQueryData,
  ProductsQueryData,
  SizesQueryData,
} from '../types'

/**
 * Fetches active products from the catalog BFF.
 */
export async function getCatalogProducts(
  input: GetCatalogProductsInput = {},
): Promise<{ items: CatalogProduct[]; total: number }> {
  const data = await fetchGraphQL<ProductsQueryData, Record<string, unknown>>({
    query: PRODUCTS_QUERY,
    variables: {
      filter: {
        productTypeSlug: input.productTypeSlug,
        colorSlug: input.colorSlug,
        sizeSlug: input.sizeSlug,
        isCustomizable: input.isCustomizable,
        search: input.search,
      },
      sort: {
        field: input.sortField,
        direction: input.sortDirection,
      },
      limit: input.limit ?? 100,
      offset: input.offset ?? 0,
    },
  })

  return data.products
}

/**
 * Fetches product types, colors, and sizes for catalog filters.
 */
export async function getCatalogFilters(): Promise<CatalogFilters> {
  const [typesData, colorsData, sizesData] = await Promise.all([
    fetchGraphQL<ProductTypesQueryData>({ query: PRODUCT_TYPES_QUERY }),
    fetchGraphQL<ColorsQueryData>({ query: COLORS_QUERY }),
    fetchGraphQL<SizesQueryData>({ query: SIZES_QUERY }),
  ])

  return {
    productTypes: typesData.productTypes,
    colors: colorsData.colors,
    sizes: sizesData.sizes,
  }
}
