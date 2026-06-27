'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Shield, Clock, HeadphonesIcon, Minus, Plus, Loader2 } from 'lucide-react'
import { PriceDisplay } from '@/components/brand/product-components'
import { routes } from '@/src/config/routes'
import { useAddCartItemMutation } from '@/src/features/storefront/cart/api/use-add-cart-item-mutation'
import {
  findVariantByColorAndSize,
  getAvailableSizesForColor,
  getSingleVariant,
  productRequiresVariantSelection,
} from '@/src/features/storefront/products/lib/product-variant.utils'
import type { StorefrontProductDetail } from '@/src/features/storefront/products/types'

const GENERIC_ADD_ERROR = 'No pudimos agregar el producto. Intenta de nuevo.'
const VARIANT_REQUIRED_MESSAGE = 'Selecciona una talla y color para continuar.'

function getInitialColorAndSize(product: StorefrontProductDetail): {
  color: string
  size: string
} {
  const single = getSingleVariant(product.variants)
  if (single) {
    return { color: single.colorSlug, size: single.sizeName }
  }
  return {
    color: product.colors[0]?.id ?? '',
    size: product.sizes.length === 1 ? (product.sizes[0] ?? '') : '',
  }
}

interface ProductInfoProps {
  product: StorefrontProductDetail
  className?: string
  onCustomize?: () => void
}

export function ProductInfo({ product, className, onCustomize }: ProductInfoProps) {
  const variants = product.variants
  const requiresVariant = productRequiresVariantSelection(variants)
  const singleVariant = useMemo(() => getSingleVariant(variants), [variants])
  const initialSelection = useMemo(() => getInitialColorAndSize(product), [product])

  const [selectedColor, setSelectedColor] = useState<string>(() => initialSelection.color)
  const [selectedSize, setSelectedSize] = useState<string>(() => initialSelection.size)
  const [quantity, setQuantity] = useState(1)
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const addToCart = useAddCartItemMutation()

  const availableSizes = useMemo(
    () => getAvailableSizesForColor(variants, selectedColor),
    [variants, selectedColor],
  )

  const selectedVariant = useMemo(() => {
    if (singleVariant) return singleVariant
    if (!selectedColor || !selectedSize) return undefined
    return findVariantByColorAndSize(variants, selectedColor, selectedSize)
  }, [singleVariant, variants, selectedColor, selectedSize])

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 10))
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1))

  const handleColorSelect = (colorId: string) => {
    const sizesForColor = getAvailableSizesForColor(variants, colorId)
    setSelectedColor(colorId)
    setSelectedSize((prev) => (sizesForColor.includes(prev) ? prev : ''))
    setSelectionError(null)
    setActionError(null)
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    setSelectionError(null)
    setActionError(null)
  }

  const handleAddToCart = async () => {
    setActionError(null)
    setSelectionError(null)
    setShowSuccess(false)

    if (requiresVariant && !selectedVariant) {
      setSelectionError(VARIANT_REQUIRED_MESSAGE)
      return
    }

    if (selectedVariant && selectedVariant.stockQty <= 0) {
      setSelectionError('Esta combinación no tiene stock disponible.')
      return
    }

    try {
      await addToCart.mutateAsync({
        productId: product.id,
        productVariantId: selectedVariant?.id ?? null,
        quantity,
      })
      setShowSuccess(true)
      setJustAdded(true)
      window.setTimeout(() => setJustAdded(false), 3000)
    } catch {
      setActionError(GENERIC_ADD_ERROR)
    }
  }

  const handleCustomize = () => {
    onCustomize?.()
  }

  const isAddDisabled =
    addToCart.isPending ||
    (requiresVariant && !selectedVariant) ||
    (selectedVariant != null && selectedVariant.stockQty <= 0)

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <p className="font-serif text-sm uppercase tracking-wider text-muted-foreground">
        {product.category}
      </p>

      <h1 className="font-sans text-2xl font-bold text-foreground md:text-3xl">{product.name}</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < Math.floor(product.rating)
                  ? 'fill-warning text-warning'
                  : 'fill-muted text-muted',
              )}
            />
          ))}
        </div>
        <span className="font-sans text-sm font-medium text-foreground">{product.rating}</span>
        <span className="font-serif text-sm text-muted-foreground">
          ({product.reviewCount} resenas)
        </span>
      </div>

      <PriceDisplay price={product.price} originalPrice={product.originalPrice} size="lg" />

      <p className="font-serif text-base leading-relaxed text-muted-foreground">
        {product.shortDescription}
      </p>

      {product.colors.length > 0 && (
        <div className="space-y-3">
          <label className="font-sans text-sm font-medium text-foreground">
            Color:{' '}
            <span className="font-normal text-muted-foreground">
              {product.colors.find((c) => c.id === selectedColor)?.name}
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => handleColorSelect(color.id)}
                disabled={!color.available}
                className={cn(
                  'relative h-10 w-10 rounded-full border-2 transition-all',
                  selectedColor === color.id
                    ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'border-border hover:border-muted-foreground',
                  !color.available && 'cursor-not-allowed opacity-55 saturate-50',
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
      )}

      {product.sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-sans text-sm font-medium text-foreground">Talla</label>
            <button type="button" className="font-sans text-sm text-primary hover:underline">
              Guia de tallas
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const sizeAvailable = !requiresVariant || availableSizes.includes(size)
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeSelect(size)}
                  disabled={!sizeAvailable}
                  className={cn(
                    'flex h-10 min-w-[3rem] items-center justify-center rounded-md border px-3 font-sans text-sm font-medium transition-all',
                    selectedSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-muted-foreground',
                    !sizeAvailable && 'cursor-not-allowed opacity-55',
                  )}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="font-sans text-sm font-medium text-foreground">Cantidad</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
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
              type="button"
              onClick={incrementQuantity}
              disabled={quantity >= 10}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              aria-label="Aumentar cantidad"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="font-serif text-sm text-foreground/80">
            {product.stock > 10 ? 'En stock' : `Solo quedan ${product.stock}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span className="font-serif text-sm text-foreground">
          Tiempo de produccion: <strong className="font-sans">5-7 dias habiles</strong>
        </span>
      </div>

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

      {selectionError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 font-serif text-sm text-destructive">
          {selectionError}
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 font-serif text-sm text-destructive">
          {actionError}
        </p>
      ) : null}

      {showSuccess ? (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4">
          <p className="font-sans text-sm font-medium text-foreground">
            Producto agregado al carrito.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="font-sans" asChild>
              <Link href={routes.cart}>Ver carrito</Link>
            </Button>
            <Button size="sm" className="font-sans" asChild>
              <Link href={routes.checkout}>Finalizar compra</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {product.customizable && (
          <Button size="lg" onClick={handleCustomize} className="w-full font-sans text-base">
            Personalizar ahora
          </Button>
        )}
        <Button
          size="lg"
          variant={product.customizable ? 'outline' : 'default'}
          onClick={() => void handleAddToCart()}
          disabled={isAddDisabled}
          className="w-full font-sans text-base"
        >
          {addToCart.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Agregando…
            </>
          ) : justAdded ? (
            'Agregado'
          ) : product.customizable ? (
            'Agregar sin personalizar'
          ) : (
            'Agregar al carrito'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-success" />
          <span className="font-serif text-sm text-foreground/75">Pago seguro</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-success" />
          <span className="font-serif text-sm text-foreground/75">Produccion profesional</span>
        </div>
        <div className="flex items-center gap-2">
          <HeadphonesIcon className="h-5 w-5 text-success" />
          <span className="font-serif text-sm text-foreground/75">Soporte personalizado</span>
        </div>
      </div>
    </div>
  )
}
