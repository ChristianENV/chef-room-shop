'use client'

import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

import { ProductImageDisplay } from '@/components/shared/product-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'
import { useProductsQuery } from '@/src/features/storefront/catalog/api/use-products-query'

import { LandingReveal, LandingStagger, LandingStaggerItem } from './components/landing-reveal'
import { SectionHeader } from './components/section-header'
import {
  mapCatalogProductToFeaturedCard,
  type FeaturedProductCardUi,
} from './mappers/featured-product.mapper'

const FEATURED_LIMIT = 4

interface FeaturedProductsProps {
  className?: string
}

function FeaturedProductsSkeleton() {
  return (
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: FEATURED_LIMIT }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-border/70 bg-background"
        >
          <Skeleton className="aspect-[3/4] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function badgeLabel(badge: FeaturedProductCardUi['badge']) {
  if (badge === 'popular') return 'Popular'
  if (badge === 'nuevo') return 'Nuevo'
  if (badge === 'personalizable') return 'Personalizable'
  return null
}

export function FeaturedProducts({ className }: FeaturedProductsProps) {
  const { data, isLoading, isError, refetch, isFetching } = useProductsQuery({
    limit: FEATURED_LIMIT,
    offset: 0,
    sortField: 'createdAt',
    sortDirection: 'desc',
  })

  const featuredProducts = (data?.items ?? []).map(mapCatalogProductToFeaturedCard)

  return (
    <section
      className={cn('bg-card py-24 md:py-32', className)}
      data-testid="featured-products-section"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <LandingReveal>
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="Selección curada"
              title="Piezas destacadas"
              description="Uniformes listos para personalizar o llevar directo a tu cocina."
              className="mb-0"
            />
            <Button
              variant="ghost"
              className="shrink-0 font-sans text-sm font-semibold text-primary hover:bg-primary/5 hover:text-primary"
              asChild
            >
              <Link href={routes.shop}>
                Ver catálogo completo
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </LandingReveal>

        {isLoading ? <FeaturedProductsSkeleton /> : null}

        {isError && !isLoading ? (
          <div className="mt-14 rounded-2xl border border-border/70 bg-background px-6 py-10 text-center">
            <p className="font-serif text-muted-foreground">
              No pudimos cargar la selección destacada. Intenta de nuevo.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && featuredProducts.length === 0 ? (
          <p className="mt-14 text-center font-serif text-muted-foreground">
            Aún estamos preparando la selección destacada.
          </p>
        ) : null}

        {!isLoading && !isError && featuredProducts.length > 0 ? (
          <LandingStagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <LandingStaggerItem key={product.id}>
                <article
                  data-testid="featured-product-card"
                  className={cn(
                    'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-500',
                    'hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5',
                    index === 0 && 'lg:rounded-3xl',
                  )}
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden bg-secondary"
                    data-testid="featured-product-image"
                  >
                    <Link href={product.href} className="absolute inset-0 z-0 block">
                      <ProductImageDisplay
                        src={product.imageUrl}
                        alt={product.alt}
                        className="absolute inset-0 !bg-transparent transition-transform duration-700 group-hover:scale-[1.04]"
                        imgClassName="object-cover object-center"
                        placeholderIconClassName="size-16"
                      />
                    </Link>
                    <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {product.badge ? (
                      <div className="absolute left-3 top-3 z-[2]">
                        <Badge
                          className={cn(
                            'border-0 font-sans text-[10px] font-semibold tracking-wider uppercase',
                            product.badge === 'popular' && 'bg-primary text-primary-foreground',
                            product.badge === 'nuevo' && 'bg-success text-success-foreground',
                            product.badge === 'personalizable' &&
                              'bg-card/95 text-primary shadow-sm backdrop-blur-sm',
                          )}
                        >
                          {badgeLabel(product.badge)}
                        </Badge>
                      </div>
                    ) : null}

                    <div className="absolute inset-x-3 bottom-3 z-[3] flex translate-y-3 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <Link
                        href={product.href}
                        className="flex-1 rounded-xl bg-primary py-2.5 text-center font-sans text-[13px] font-semibold text-primary-foreground shadow-lg"
                      >
                        Ver producto
                      </Link>
                      {product.customizable ? (
                        <Link
                          href={product.customizeHref}
                          className="rounded-xl border border-primary/30 bg-card/95 px-3 py-2.5 font-sans text-[12px] font-semibold text-primary backdrop-blur-sm"
                        >
                          Personalizar
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <p className="font-serif text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                      {product.categoryLabel}
                    </p>
                    <Link href={product.href}>
                      <h3 className="mt-2 font-sans text-base font-semibold leading-snug text-foreground line-clamp-2 transition-colors hover:text-primary">
                        {product.title}
                      </h3>
                    </Link>

                    <div className="mt-2.5 flex items-center gap-1">
                      <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                      <span className="font-sans text-xs font-medium">{product.rating}</span>
                      <span className="font-serif text-xs text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>

                    <div className="mt-auto pt-4">
                      <span className="font-sans text-xl font-bold tracking-tight text-foreground">
                        {product.priceLabel}
                      </span>
                      {product.compareAtPriceLabel ? (
                        <span className="ml-2 font-serif text-sm text-muted-foreground line-through">
                          {product.compareAtPriceLabel}
                        </span>
                      ) : null}
                    </div>

                    {product.colorSwatches.length > 1 ? (
                      <div className="mt-3 flex items-center gap-1.5">
                        {product.colorSwatches.slice(0, 4).map((color) => (
                          <div
                            key={color.id}
                            className="size-4 rounded-full border border-border shadow-sm"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              </LandingStaggerItem>
            ))}
          </LandingStagger>
        ) : null}
      </div>
    </section>
  )
}
