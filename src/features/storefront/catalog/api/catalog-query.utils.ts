import type { Product } from '@/lib/types'

import type { FilterState } from '../catalog-filters'
import type { SortOption } from '../sort-select'
import type { ProductsQueryParams } from './catalog-query.types'

/**
 * Maps UI sort option to BFF sort fields (client-only sorts return undefined).
 */
export function mapSortToQuery(
  sortBy: SortOption,
): Pick<ProductsQueryParams, 'sortField' | 'sortDirection'> {
  switch (sortBy) {
    case 'price-asc':
      return { sortField: 'price', sortDirection: 'asc' }
    case 'price-desc':
      return { sortField: 'price', sortDirection: 'desc' }
    case 'newest':
      return { sortField: 'createdAt', sortDirection: 'desc' }
    case 'popular':
    case 'rating':
    default:
      return {}
  }
}

/**
 * Builds BFF query params from UI filter state (single-value server filters).
 */
export function buildProductsQueryParams(
  filters: FilterState,
  sortBy: SortOption,
  search?: string,
): ProductsQueryParams {
  const sort = mapSortToQuery(sortBy)

  return {
    productTypeSlug: filters.categories.length === 1 ? filters.categories[0] : undefined,
    colorSlug: filters.colors.length === 1 ? filters.colors[0] : undefined,
    sizeSlug: filters.sizes.length === 1 ? filters.sizes[0] : undefined,
    isCustomizable: filters.customizable === true ? true : undefined,
    search: search?.trim() || undefined,
    limit: 100,
    offset: 0,
    ...sort,
  }
}

/**
 * Applies UI-only filters and client-side sort (multi-select, price, popular/rating).
 */
export function applyClientFilters(
  products: Product[],
  filters: FilterState,
  sortBy: SortOption,
): Product[] {
  let result = [...products]

  if (filters.categories.length > 1) {
    const allowedProductTypes = new Set(filters.categories)
    result = result.filter(
      (product) =>
        product.productTypeSlug != null && allowedProductTypes.has(product.productTypeSlug),
    )
  }

  if (filters.colors.length > 1) {
    result = result.filter((p) => p.colors.some((color) => filters.colors.includes(color.id)))
  }

  if (filters.sizes.length > 1) {
    result = result.filter((p) =>
      p.sizes.some((sizeName) =>
        filters.sizes.some((slug) => sizeName.toLowerCase() === slug.toLowerCase()),
      ),
    )
  }

  result = result.filter(
    (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
  )

  if (filters.customizable === true && filters.categories.length !== 1) {
    result = result.filter((p) => p.customizable)
  }

  switch (sortBy) {
    case 'rating':
      result = [...result].sort((a, b) => b.rating - a.rating)
      break
    case 'popular':
    default:
      if (sortBy === 'popular') {
        result = [...result].sort(
          (a, b) => b.reviewCount - a.reviewCount || a.name.localeCompare(b.name),
        )
      }
      break
  }

  return result
}
