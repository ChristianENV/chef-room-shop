'use client'

import { useQuery } from '@tanstack/react-query'

import { getCatalogFilters } from './catalog.api'
import { catalogQueryKeys } from './catalog.query-keys'

/**
 * Fetches product types, colors, and sizes for catalog filter UI.
 */
export function useCatalogFiltersQuery() {
  return useQuery({
    queryKey: catalogQueryKeys.filters(),
    queryFn: getCatalogFilters,
  })
}
