'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { routes } from '@/src/config/routes'
import { parseShopCategorySlug, shopCategoryToFilterCategories } from '@/src/config/shop-category'
import {
  CatalogHero,
  CatalogFilters,
  MobileFiltersSheet,
  ActiveFilters,
  SortSelect,
  CatalogProductCard,
  CatalogSkeleton,
  CatalogEmptyState,
  toCatalogFilterOptions,
  type FilterState,
  type SortOption,
} from '@/src/features/storefront/catalog'
import { getCatalogUserErrorMessage } from '@/src/features/storefront/catalog/api/catalog-errors'
import {
  applyClientFilters,
  buildProductsQueryParams,
} from '@/src/features/storefront/catalog/api/catalog-query.utils'
import { useCatalogFiltersQuery } from '@/src/features/storefront/catalog/api/use-catalog-filters-query'
import { useProductsQuery } from '@/src/features/storefront/catalog/api/use-products-query'
import { useShopCatalogUrl } from '@/src/features/storefront/catalog/hooks/use-shop-catalog-url'
import { mapCatalogProductToCard } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'
import { resolveProductTypeByPublicSlug } from '@/src/features/storefront/catalog/product-type.helpers'
import type { CatalogProductType } from '@/src/features/storefront/catalog/types'

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  sizes: [],
  colors: [],
  priceRange: [0, 3000],
  customizable: null,
  productionTime: [],
  materials: [],
}

function buildInitialFilters(
  searchParams: ReturnType<typeof useSearchParams>,
  productTypes: CatalogProductType[] = [],
): FilterState {
  const category = parseShopCategorySlug(searchParams.get('category'))
  return {
    ...DEFAULT_FILTERS,
    categories: shopCategoryToFilterCategories(category, productTypes),
  }
}

function ShopPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: filtersData, isLoading: isFiltersLoading } = useCatalogFiltersQuery()
  const productTypes = filtersData?.productTypes ?? []

  const [filters, setFilters] = useState<FilterState>(() =>
    buildInitialFilters(searchParams, productTypes),
  )
  const [sortBy, setSortBy] = useState<SortOption>('popular')

  const { setFiltersWithUrl, clearFiltersWithUrl } = useShopCatalogUrl({
    setFilters,
    productTypes,
  })

  const productsQueryParams = useMemo(
    () => buildProductsQueryParams(filters, sortBy),
    [filters, sortBy],
  )

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useProductsQuery(productsQueryParams)

  const filterOptions = useMemo(
    () => (filtersData ? toCatalogFilterOptions(filtersData) : undefined),
    [filtersData],
  )

  const categoryParam = parseShopCategorySlug(searchParams.get('category'))
  const unknownCategory = useMemo(() => {
    if (!categoryParam || !filtersData) return false
    return resolveProductTypeByPublicSlug(categoryParam, filtersData.productTypes) === null
  }, [categoryParam, filtersData])

  const products = useMemo(() => {
    if (unknownCategory) return []
    const items = productsData?.items.map(mapCatalogProductToCard) ?? []
    return applyClientFilters(items, filters, sortBy)
  }, [productsData, filters, sortBy, unknownCategory])

  const isLoading = isProductsLoading || isFiltersLoading
  const errorMessage = isProductsError
    ? getCatalogUserErrorMessage(productsError, 'No se pudo cargar el catálogo. Intenta de nuevo.')
    : null

  const activeFilterCount = useMemo(() => {
    let count = 0
    count += filters.categories.length
    count += filters.sizes.length
    count += filters.colors.length
    count += filters.productionTime.length
    count += filters.materials.length
    if (filters.customizable !== null) count += 1
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) count += 1
    return count
  }, [filters])

  const handleClearFilters = () => {
    clearFiltersWithUrl(DEFAULT_FILTERS)
  }

  const filterProps = {
    filters,
    onFiltersChange: setFiltersWithUrl,
    filterOptions,
    isLoadingOptions: isFiltersLoading,
  }

  return (
    <>
      <CatalogHero />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <MobileFiltersSheet {...filterProps} activeFilterCount={activeFilterCount} />

            <p className="font-serif text-sm text-muted-foreground">
              {isLoading
                ? 'Cargando productos…'
                : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-6">
            <ActiveFilters
              filters={filters}
              onFiltersChange={setFiltersWithUrl}
              filterOptions={filterOptions}
            />
          </div>
        )}

        <div className="flex gap-8">
          <CatalogFilters {...filterProps} />

          <div className="flex-1">
            {isLoading ? (
              <CatalogSkeleton count={8} />
            ) : errorMessage ? (
              <CatalogEmptyState
                variant="error"
                onRetry={() => {
                  void refetchProducts()
                }}
              />
            ) : products.length === 0 ? (
              <CatalogEmptyState
                variant={unknownCategory ? 'unknown-category' : 'no-results'}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    onView={() => router.push(routes.productDetail(product.slug))}
                    onCustomize={() => router.push(routes.customizeProduct(product.slug))}
                    onQuickView={() => {
                      router.push(routes.productDetail(product.slug))
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ShopPageFallback() {
  return (
    <>
      <CatalogHero />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <CatalogSkeleton count={8} />
      </div>
    </>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageFallback />}>
      <ShopPageContent />
    </Suspense>
  )
}
