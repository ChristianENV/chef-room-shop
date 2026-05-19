'use client'

import { useState, useMemo } from 'react'
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
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import type { Product } from '@/lib/types'

// TODO: Replace with TanStack Query useProductsQuery hook
// import { useProductsQuery } from '@/hooks/use-products-query'

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

  // Filter state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  
  // Loading and error states for future API integration
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  // TODO: Replace with TanStack Query
  // const { data: products, isLoading, error } = useProductsQuery(filters, sortBy)

  // Count active filters
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

  // Filter and sort products (mock implementation)
  const filteredProducts = useMemo(() => {
    let result = [...MOCK_PRODUCTS]

    // Filter by category
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category))
    }

    // Filter by size
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((size) => filters.sizes.includes(size))
      )
    }

    // Filter by color
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((color) => filters.colors.includes(color.id))
      )
    }

    // Filter by price range
    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    )

    // Filter by customizable
    if (filters.customizable === true) {
      result = result.filter((p) => p.customizable)
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        // In a real app, sort by createdAt
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
        result = [...result].sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }

    return result
  }, [filters, sortBy])

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <>
      <CatalogHero />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Filters */}
            <MobileFiltersSheet
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />
            
            {/* Results count */}
            <p className="font-serif text-sm text-muted-foreground">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Sort */}
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="mb-6">
            <ActiveFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        {/* Content Area */}
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <CatalogFilters filters={filters} onFiltersChange={setFilters} />

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <CatalogSkeleton count={8} />
            ) : error ? (
              <CatalogEmptyState
                variant="error"
                onRetry={() => {
                  // TODO: Refetch with TanStack Query
                  console.log('Retry fetch')
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
                      // TODO: Open quick view modal
                      console.log('Quick view:', product.slug)
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
