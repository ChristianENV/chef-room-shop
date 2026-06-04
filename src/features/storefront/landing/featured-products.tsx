'use client'

import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

import { ProductImageDisplay } from '@/components/shared/product-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { routes } from '@/src/config/routes'

import { LandingReveal, LandingStagger, LandingStaggerItem } from './components/landing-reveal'
import { SectionHeader } from './components/section-header'

const featuredProducts = MOCK_PRODUCTS.slice(0, 4)

interface FeaturedProductsProps {
  className?: string
}

export function FeaturedProducts({ className }: FeaturedProductsProps) {
  return (
    <section className={cn('bg-card py-24 md:py-32', className)}>
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

        <LandingStagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <LandingStaggerItem key={product.id}>
              <Link
                href={
                  product.customizable
                    ? routes.customizeProduct(product.slug)
                    : routes.productDetail(product.slug)
                }
                className="group block h-full"
              >
                <article
                  className={cn(
                    'flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition-all duration-500',
                    'hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5',
                    index === 0 && 'lg:rounded-3xl',
                  )}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                    <ProductImageDisplay
                      images={product.images}
                      alt={product.name}
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"
                      placeholderIconClassName="size-16"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="absolute left-3 top-3 flex flex-col gap-2">
                      {product.badge ? (
                        <Badge
                          className={cn(
                            'border-0 font-sans text-[10px] font-semibold tracking-wider uppercase',
                            product.badge === 'popular' && 'bg-primary text-primary-foreground',
                            product.badge === 'nuevo' && 'bg-success text-success-foreground',
                            product.badge === 'personalizable' &&
                              'bg-card/95 text-primary shadow-sm backdrop-blur-sm',
                          )}
                        >
                          {product.badge === 'popular'
                            ? 'Popular'
                            : product.badge === 'nuevo'
                              ? 'Nuevo'
                              : 'Personalizable'}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-xl bg-primary py-2.5 text-center font-sans text-[13px] font-semibold text-primary-foreground shadow-lg">
                        {product.customizable ? 'Personalizar' : 'Ver producto'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <p className="font-serif text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                      {product.category}
                    </p>
                    <h3 className="mt-2 font-sans text-base font-semibold leading-snug text-foreground line-clamp-2">
                      {product.name}
                    </h3>

                    {product.rating ? (
                      <div className="mt-2.5 flex items-center gap-1">
                        <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                        <span className="font-sans text-xs font-medium">{product.rating}</span>
                        <span className="font-serif text-xs text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-auto pt-4">
                      <span className="font-sans text-xl font-bold tracking-tight text-foreground">
                        ${product.price.toLocaleString('es-MX')}
                      </span>
                      {product.originalPrice ? (
                        <span className="ml-2 font-serif text-sm text-muted-foreground line-through">
                          ${product.originalPrice.toLocaleString('es-MX')}
                        </span>
                      ) : null}
                    </div>

                    {product.colors.length > 1 ? (
                      <div className="mt-3 flex items-center gap-1.5">
                        {product.colors.slice(0, 4).map((color) => (
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
              </Link>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </div>
    </section>
  )
}
