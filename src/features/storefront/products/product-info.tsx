'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Shield, Clock, HeadphonesIcon, Minus, Plus } from 'lucide-react'
import type { Product, ProductColor } from '@/lib/types'
import { PriceDisplay } from '@/components/brand/product-components'

interface ProductInfoProps {
  product: Product
  className?: string
  onCustomize?: () => void
}

export function ProductInfo({ product, className, onCustomize }: ProductInfoProps) {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.id || '')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, 10))
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1))

  // TODO: Replace with useAddToCart mutation from TanStack Query
  const handleAddToCart = () => {
    console.log('Add to cart:', { 
      productId: product.id, 
      color: selectedColor, 
      size: selectedSize, 
      quantity,
      customized: false 
    })
  }

  const handleCustomize = () => {
    onCustomize?.()
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Category */}
      <p className="font-serif text-sm uppercase tracking-wider text-muted-foreground">
        {product.category}
      </p>

      {/* Product Name */}
      <h1 className="font-sans text-2xl font-bold text-foreground md:text-3xl">
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                'h-4 w-4',
                i < Math.floor(product.rating) 
                  ? 'fill-warning text-warning' 
                  : 'fill-muted text-muted'
              )} 
            />
          ))}
        </div>
        <span className="font-sans text-sm font-medium text-foreground">
          {product.rating}
        </span>
        <span className="font-serif text-sm text-muted-foreground">
          ({product.reviewCount} resenas)
        </span>
      </div>

      {/* Price */}
      <PriceDisplay 
        price={product.price} 
        originalPrice={product.originalPrice}
        size="lg"
      />

      {/* Short Description */}
      <p className="font-serif text-base leading-relaxed text-muted-foreground">
        {product.shortDescription}
      </p>

      {/* Color Selector */}
      <div className="space-y-3">
        <label className="font-sans text-sm font-medium text-foreground">
          Color: <span className="font-normal text-muted-foreground">
            {product.colors.find(c => c.id === selectedColor)?.name}
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              disabled={!color.available}
              className={cn(
                'relative h-10 w-10 rounded-full border-2 transition-all',
                selectedColor === color.id 
                  ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' 
                  : 'border-border hover:border-muted-foreground',
                !color.available && 'cursor-not-allowed opacity-40'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Seleccionar color ${color.name}`}
            >
              {!color.available && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <div className="h-[2px] w-full rotate-45 bg-destructive" />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-sans text-sm font-medium text-foreground">
            Talla
          </label>
          <button className="font-sans text-sm text-primary hover:underline">
            Guia de tallas
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                'flex h-10 min-w-[3rem] items-center justify-center rounded-md border px-3 font-sans text-sm font-medium transition-all',
                selectedSize === size 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-border bg-card text-foreground hover:border-muted-foreground'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <label className="font-sans text-sm font-medium text-foreground">
          Cantidad
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-border">
            <button
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              aria-label="Disminuir cantidad"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-10 w-12 items-center justify-center font-sans text-sm font-medium text-foreground">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              disabled={quantity >= 10}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="font-serif text-sm text-muted-foreground">
            {product.stock > 10 ? 'En stock' : `Solo quedan ${product.stock}`}
          </span>
        </div>
      </div>

      {/* Production Time */}
      <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span className="font-serif text-sm text-foreground">
          Tiempo de produccion: <strong className="font-sans">5-7 dias habiles</strong>
        </span>
      </div>

      {/* Personalization Summary (if customizable) */}
      {product.customizable && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-sans text-sm font-semibold text-foreground">
                Personalizacion disponible
              </h3>
              <p className="mt-1 font-serif text-sm text-muted-foreground">
                Agrega bordado, logo o texto personalizado
              </p>
            </div>
            <Badge variant="outline" className="border-primary text-primary">
              +$199
            </Badge>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3">
        {product.customizable && (
          <Button 
            size="lg" 
            onClick={handleCustomize}
            className="w-full font-sans text-base"
          >
            Personalizar ahora
          </Button>
        )}
        <Button 
          size="lg" 
          variant={product.customizable ? 'outline' : 'default'}
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className="w-full font-sans text-base"
        >
          {product.customizable ? 'Agregar sin personalizar' : 'Agregar al carrito'}
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-success" />
          <span className="font-serif text-sm text-muted-foreground">Pago seguro</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-success" />
          <span className="font-serif text-sm text-muted-foreground">Produccion profesional</span>
        </div>
        <div className="flex items-center gap-2">
          <HeadphonesIcon className="h-5 w-5 text-success" />
          <span className="font-serif text-sm text-muted-foreground">Soporte personalizado</span>
        </div>
      </div>
    </div>
  )
}
