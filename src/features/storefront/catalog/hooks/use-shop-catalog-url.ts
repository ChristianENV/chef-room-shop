'use client'

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { routes } from '@/src/config/routes'
import {
  parseShopCategorySlug,
  shopCategoryToFilterCategories,
  shopUrlFromFilterState,
} from '@/src/config/shop-category'

import type { FilterState } from '../catalog-filters'
import type { CatalogProductType } from '../types'

type UseShopCatalogUrlOptions = {
  setFilters: Dispatch<SetStateAction<FilterState>>
  productTypes?: CatalogProductType[]
}

/**
 * Keeps `/shop?category=` and catalog filter state in sync (bidirectional).
 */
export function useShopCatalogUrl({ setFilters, productTypes = [] }: UseShopCatalogUrlOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const skipUrlSyncRef = useRef(false)

  useEffect(() => {
    if (pathname !== routes.shop) return

    const category = parseShopCategorySlug(searchParams.get('category'))
    const categories = shopCategoryToFilterCategories(category, productTypes)

    skipUrlSyncRef.current = true
    setFilters((prev) => {
      const same =
        prev.categories.length === categories.length &&
        prev.categories.every((slug, i) => slug === categories[i])
      if (same) return prev
      return { ...prev, categories }
    })
    queueMicrotask(() => {
      skipUrlSyncRef.current = false
    })
  }, [pathname, productTypes, searchParams, setFilters])

  const replaceShopUrl = useCallback(
    (nextFilters: FilterState) => {
      if (pathname !== routes.shop || skipUrlSyncRef.current) return
      const target = shopUrlFromFilterState(nextFilters, productTypes)
      const current =
        searchParams.toString().length > 0 ? `${pathname}?${searchParams.toString()}` : pathname
      if (target === current) return
      router.replace(target)
    },
    [pathname, productTypes, router, searchParams],
  )

  const setFiltersWithUrl = useCallback(
    (updater: FilterState | ((prev: FilterState) => FilterState)) => {
      setFilters((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        replaceShopUrl(next)
        return next
      })
    },
    [replaceShopUrl, setFilters],
  )

  const clearFiltersWithUrl = useCallback(
    (defaultFilters: FilterState) => {
      setFilters(defaultFilters)
      if (pathname === routes.shop) {
        router.replace(routes.shop)
      }
    },
    [pathname, router, setFilters],
  )

  return { setFiltersWithUrl, clearFiltersWithUrl, searchParams }
}
