import type { CatalogFilters } from './types'

/** Filter sidebar option shape (from BFF reference data). */
export type CatalogFilterOptions = {
  productTypes: Array<{ slug: string; label: string }>
  colors: Array<{ slug: string; label: string; hex: string }>
  sizes: Array<{ slug: string; label: string }>
}

export const EMPTY_FILTER_OPTIONS: CatalogFilterOptions = {
  productTypes: [],
  colors: [],
  sizes: [],
}

/**
 * Maps BFF filter reference data to UI filter options.
 */
export function toCatalogFilterOptions(data: CatalogFilters): CatalogFilterOptions {
  return {
    productTypes: data.productTypes.map((type) => ({
      slug: type.slug,
      label: type.name,
    })),
    colors: data.colors.map((color) => ({
      slug: color.slug,
      label: color.name,
      hex: color.hexCode,
    })),
    sizes: data.sizes.map((size) => ({
      slug: size.slug,
      label: size.name.toUpperCase(),
    })),
  }
}
