import { routes } from '@/src/config/routes'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductImageDisplay } from '@/components/shared/product-image'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

const featuredProducts = MOCK_PRODUCTS.slice(0, 4)

interface FeaturedProductsProps {
  className?: string
}

export function FeaturedProducts({ className }: FeaturedProductsProps) {
  return (
    <section className={cn('bg-background py-20 md:py-28', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
              Seleccion curada
            </p>
            <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Productos destacados
            </h2>
          </div>
          <Button variant="ghost" className="font-sans text-sm font-semibold text-primary hover:text-primary/80" asChild>
            <Link href={routes.shop}>
              Ver todo el catalogo
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={
                product.customizable
                  ? routes.customizeProduct(product.slug)
                  : routes.productDetail(product.slug)
              }
              className="group"
            >
              <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                  <ProductImageDisplay
                    images={product.images}
                    alt={product.name}
                    className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                    placeholderIconClassName="h-16 w-16"
                  />

                  {/* Badges */}
                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                    {product.badge && (
                      <Badge
                        className={cn(
                          'border-0 font-sans text-[10px] font-semibold tracking-wider uppercase',
                          product.badge === 'popular' && 'bg-primary text-primary-foreground',
                          product.badge === 'nuevo' && 'bg-success text-success-foreground',
                          product.badge === 'personalizable' && 'bg-card text-primary shadow-sm'
                        )}
                      >
                        {product.badge === 'popular'
                          ? 'Popular'
                          : product.badge === 'nuevo'
                            ? 'Nuevo'
                            : 'Personalizable'}
                      </Badge>
                    )}
                    {product.customizable && product.badge !== 'personalizable' && (
                      <Badge className="border-0 bg-card font-sans text-[10px] font-semibold tracking-wider uppercase text-primary shadow-sm">
                        Personalizable
                      </Badge>
                    )}
                  </div>

                  {/* Hover CTA */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-xl bg-primary py-2.5 text-center font-sans text-[13px] font-semibold text-primary-foreground shadow-lg">
                      {product.customizable ? 'Personalizar' : 'Ver producto'}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="font-serif text-[11px] tracking-wider uppercase text-muted-foreground">
                    {product.category}
                  </p>
                  <h3 className="mt-1.5 font-sans text-[15px] font-semibold leading-snug text-foreground line-clamp-2">
                    {product.name}
                  </h3>

                  {product.rating && (
                    <div className="mt-2.5 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span className="font-sans text-xs font-medium text-foreground">
                        {product.rating}
                      </span>
                      <span className="font-serif text-xs text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-sans text-lg font-bold text-foreground">
                      ${product.price.toLocaleString('es-MX')}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="font-serif text-sm text-muted-foreground line-through">
                          ${product.originalPrice.toLocaleString('es-MX')}
                        </span>
                        <span className="font-sans text-[11px] font-bold text-success">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  {product.colors.length > 1 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      {product.colors.slice(0, 4).map((color) => (
                        <div
                          key={color.id}
                          className="h-4 w-4 rounded-full border border-border"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                      {product.colors.length > 4 && (
                        <span className="font-serif text-[11px] text-muted-foreground">
                          +{product.colors.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
