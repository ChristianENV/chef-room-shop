'use client'

import { cn } from '@/lib/utils'
import { ProductImageDisplay } from '@/components/shared/product-image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Heart } from 'lucide-react'
import type { Product } from '@/lib/types'
import Link from 'next/link'

interface RelatedProductsProps {
  currentProductId: string
  products: Product[]
  className?: string
}

export function RelatedProducts({ currentProductId, products, className }: RelatedProductsProps) {
  // Filter out current product and take 4
  const relatedProducts = products.filter((p) => p.id !== currentProductId).slice(0, 4)

  if (relatedProducts.length === 0) return null

  return (
    <section className={cn('py-12', className)}>
      <div className="mb-8">
        <h2 className="font-sans text-2xl font-bold text-foreground">Productos relacionados</h2>
        <p className="mt-2 font-serif text-muted-foreground">
          Otros productos que podrian interesarte
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {relatedProducts.map((product) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-secondary">
          <ProductImageDisplay
            images={product.images}
            alt={product.name}
            className="absolute inset-0"
            placeholderIconClassName="h-12 w-12"
          />

          {/* Badge */}
          {product.badge && (
            <Badge
              className={cn(
                'absolute left-2 top-2 text-xs',
                product.badge === 'nuevo' && 'bg-success text-success-foreground',
                product.badge === 'popular' && 'bg-primary text-primary-foreground',
                product.badge === 'oferta' && 'bg-destructive text-destructive-foreground',
              )}
            >
              {product.badge === 'nuevo' && 'Nuevo'}
              {product.badge === 'popular' && 'Popular'}
              {product.badge === 'oferta' && 'Oferta'}
              {product.badge === 'personalizable' && 'Personalizable'}
            </Badge>
          )}

          {/* Wishlist */}
          <button
            className="absolute right-2 top-2 rounded-full bg-card/90 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault()
              console.log('Add to wishlist:', product.id)
            }}
          >
            <Heart className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <CardContent className="p-3">
          <p className="font-serif text-xs uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="mt-1 font-sans text-sm font-medium text-foreground line-clamp-1">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="font-serif text-xs text-muted-foreground">{product.rating}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-sans font-bold text-foreground">
              ${product.price.toLocaleString('es-MX')}
            </span>
            {product.originalPrice && (
              <span className="font-serif text-xs text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString('es-MX')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
