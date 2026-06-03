'use client'

import { useProductsQuery } from '@/src/features/storefront/catalog/api/use-products-query'

/**
 * Loads active customizable products for the customizer product picker.
 */
export function useCustomizableProductsQuery() {
  return useProductsQuery({
    isCustomizable: true,
    limit: 100,
    sortField: 'name',
    sortDirection: 'asc',
  })
}
