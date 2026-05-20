import type { ProductsQueryParams } from './catalog-query.types'

export const catalogQueryKeys = {
  all: ['catalog'] as const,
  products: (params: ProductsQueryParams) =>
    [...catalogQueryKeys.all, 'products', params] as const,
  filters: () => [...catalogQueryKeys.all, 'filters'] as const,
  productTypes: () => [...catalogQueryKeys.all, 'productTypes'] as const,
  colors: () => [...catalogQueryKeys.all, 'colors'] as const,
  sizes: () => [...catalogQueryKeys.all, 'sizes'] as const,
}
