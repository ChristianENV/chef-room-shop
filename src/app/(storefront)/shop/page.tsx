'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { routes } from '@/src/config/routes'
import {
  CatalogHero,
  CatalogFilters,
  MobileFiltersSheet,
  ActiveFilters,
  SortSelect,
  CatalogProductCard,
  CatalogSkeleton,
  CatalogEmptyState,
  type FilterState,
  type SortOption,
} from '@/src/features/storefront/catalog'
import { getCatalogProducts } from '@/src/features/storefront/catalog/api/catalog.api'
import { mapCatalogProductToCard } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'
import type { Product } from '@/lib/types'
import { GraphQLRequestError } from '@/src/lib/graphql/errors'

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  sizes: [],
  colors: [],
  priceRange: [0, 3000],
  customizable: null,
  productionTime: [],
  materials: [],
}

export default function ShopPage() {
  const router = useRouter()

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { items } = await getCatalogProducts({ limit: 100 })
      setProducts(items.map(mapCatalogProductToCard))
    } catch (err) {
      const message =
        err instanceof GraphQLRequestError
          ? err.message
          : 'No se pudo cargar el catálogo'
      setError(message)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadProducts])

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

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category))
    }

    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((size) => filters.sizes.includes(size)),
      )
    }

    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((color) => filters.colors.includes(color.id)),
      )
    }

    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1],
    )

    if (filters.customizable === true) {
      result = result.filter((p) => p.customizable)
    }

    switch (sortBy) {
      case 'newest':
        result = [...result].reverse()
        break
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      case 'popular':
      default:
        result = [...result].sort(
          (a, b) => b.reviewCount - a.reviewCount || a.name.localeCompare(b.name),
        )
        break
    }

    return result
  }, [filters, sortBy, products])

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <>
      <CatalogHero />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <MobileFiltersSheet
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />

            <p className="font-serif text-sm text-muted-foreground">
              {isLoading
                ? 'Cargando productos…'
                : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-6">
            <ActiveFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        <div className="flex gap-8">
          <CatalogFilters filters={filters} onFiltersChange={setFilters} />

          <div className="flex-1">
            {isLoading ? (
              <CatalogSkeleton count={8} />
            ) : error ? (
              <CatalogEmptyState
                variant="error"
                onRetry={() => {
                  void loadProducts()
                }}
              />
            ) : filteredProducts.length === 0 ? (
              <CatalogEmptyState
                variant="no-results"
                onClearFilters={handleClearFilters}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <CatalogProductCard
                    key={product.id}
                    product={product}
                    onView={() => router.push(routes.productDetail(product.slug))}
                    onCustomize={() => router.push(routes.customize)}
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
