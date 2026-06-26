'use client'

import { useMemo } from 'react'

import { useCatalogFiltersQuery } from '@/src/features/storefront/catalog/api/use-catalog-filters-query'
import { buildShopNavCategories } from '@/src/features/storefront/catalog/build-shop-nav-categories'

export function useShopNavCategories() {
  const { data, isLoading } = useCatalogFiltersQuery()
  const categories = useMemo(
    () => buildShopNavCategories(data?.productTypes ?? []),
    [data?.productTypes],
  )
  return { categories, isLoading }
}
