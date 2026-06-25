import type { CatalogFilters } from './types'
import {
  getActiveProductTypes,
  getProductTypeDisplayName,
  getProductTypePublicSlug,
} from './product-type.helpers'

/** Filter sidebar option shape (from BFF reference data). */
export type CatalogFilterOptions = {
  productTypes: Array<{ slug: string; label: string; publicSlug: string }>
  colors: Array<{ slug: string; label: string; hex: string }>
  sizes: Array<{ slug: string; label: string }>
}

export const EMPTY_FILTER_OPTIONS: CatalogFilterOptions = {
  productTypes: [],
  colors: [],
  sizes: [],
}

function compareSortOrder(a: number | null | undefined, b: number | null | undefined): number {
  return (a ?? 0) - (b ?? 0)
}

/**
 * Maps BFF filter reference data to UI filter options.
 */
export function toCatalogFilterOptions(data: CatalogFilters): CatalogFilterOptions {
  return {
    productTypes: getActiveProductTypes(data.productTypes).map((type) => ({
      slug: type.slug,
      label: getProductTypeDisplayName(type),
      publicSlug: getProductTypePublicSlug(type),
    })),
    colors: data.colors.map((color) => ({
      slug: color.slug,
      label: color.name,
      hex: color.hexCode,
    })),
    sizes: [...data.sizes]
      .sort((a, b) => compareSortOrder(a.sortOrder, b.sortOrder))
      .map((size) => ({
        slug: size.slug,
        label: size.name.toUpperCase(),
      })),
  }
}
