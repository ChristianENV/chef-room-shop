'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Minus, 
  Plus, 
  Trash2, 
  Pencil, 
  Palette,
  Type,
  ImageIcon
} from 'lucide-react'
import type { CartItem as CartItemType } from '@/lib/types'

interface CartItemCardProps {
  item: CartItemType
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  className?: string
}

export function CartItemCard({ 
  item, 
  onUpdateQuantity, 
  onRemove,
  className 
}: CartItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  const { product, customization } = item
  const hasCustomization = customization.embroidery !== undefined
  const customizationPrice = hasCustomization ? 199 : 0 // Mock price
  const itemTotal = (product.price + customizationPrice) * customization.quantity

  const handleQuantityChange = async (delta: number) => {
    const newQuantity = customization.quantity + delta
    if (newQuantity < 1 || newQuantity > 10) return
    
    setIsUpdating(true)
    // TODO: Integrate with TanStack Query mutation for updateCartItem
    await new Promise(resolve => setTimeout(resolve, 200))
    onUpdateQuantity(item.id, newQuantity)
    setIsUpdating(false)
  }

  const selectedColor = product.colors.find(c => c.id === customization.selectedColor)

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card p-4 md:p-6',
      className
    )}>
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-secondary sm:h-36 sm:w-36">
            <Image
              src={product.images[0]?.url || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {hasCustomization && (
              <div className="absolute left-2 top-2">
                <Badge className="bg-accent text-white">
                  <Palette className="mr-1 h-3 w-3" />
                  Personalizado
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {product.category}
              </p>
              <Link 
                href={`/products/${product.slug}`}
                className="font-sans text-lg font-semibold text-foreground hover:text-accent"
              >
                {product.name}
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>

          {/* Variants */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="font-serif">Talla:</span>
              <span className="font-sans font-medium text-foreground">{customization.selectedSize}</span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5">
              <span className="font-serif">Color:</span>
              <span className="flex items-center gap-1">
                {selectedColor && (
                  <span 
                    className="inline-block h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                )}
                <span className="font-sans font-medium text-foreground">
                  {selectedColor?.name || customization.selectedColor}
                </span>
              </span>
            </span>
          </div>

          {/* Customization Summary */}
          {hasCustomization && customization.embroidery && (
            <CustomizationSnapshot embroidery={customization.embroidery} />
          )}

          {/* Price & Quantity */}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm text-muted-foreground">Cantidad:</span>
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={customization.quantity <= 1 || isUpdating}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center font-sans font-medium">
                  {customization.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => handleQuantityChange(1)}
                  disabled={customization.quantity >= 10 || isUpdating}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Pricing */}
            <div className="text-right">
              <div className="space-y-0.5 text-sm text-muted-foreground">
                <p>
                  <span className="font-serif">Base:</span>{' '}
                  <span className="font-sans">${product.price.toLocaleString('es-MX')} MXN</span>
                </p>
                {hasCustomization && (
                  <p>
                    <span className="font-serif">Personalizacion:</span>{' '}
                    <span className="font-sans text-accent">+${customizationPrice} MXN</span>
                  </p>
                )}
              </div>
              <p className="mt-1 font-sans text-xl font-bold text-foreground">
                ${itemTotal.toLocaleString('es-MX')} MXN
              </p>
            </div>
          </div>

          {/* Edit Design Button */}
          {hasCustomization && (
            <div className="mt-4 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full sm:w-auto"
              >
                <Link href={`/customize/${product.slug}?edit=${item.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar diseno
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Customization Snapshot Sub-component
interface CustomizationSnapshotProps {
  embroidery: NonNullable<CartItemType['customization']['embroidery']>
}

function CustomizationSnapshot({ embroidery }: CustomizationSnapshotProps) {
  const positionLabels: Record<string, string> = {
    'pecho-izquierdo': 'Pecho Izq.',
    'pecho-derecho': 'Pecho Der.',
    'espalda': 'Espalda',
    'manga': 'Manga',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    'nombre': <Type className="h-3 w-3" />,
    'logo': <ImageIcon className="h-3 w-3" />,
    'iniciales': <Type className="h-3 w-3" />,
    'diseño': <Palette className="h-3 w-3" />,
  }

  const typeLabels: Record<string, string> = {
    'nombre': 'Nombre bordado',
    'logo': 'Logo incluido',
    'iniciales': 'Iniciales',
    'diseño': 'Diseno personalizado',
  }

  return (
    <div className="mt-3 rounded-lg bg-secondary/50 p-3">
      <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Personalizacion
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1.5">
          {typeIcons[embroidery.type]}
          {typeLabels[embroidery.type]}
        </Badge>
        <Badge variant="secondary">
          {positionLabels[embroidery.position] || embroidery.position}
        </Badge>
        {embroidery.text && (
          <Badge variant="outline" className="font-serif">
            &quot;{embroidery.text}&quot;
          </Badge>
        )}
      </div>
      {/* Design ID for future reference */}
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        ID: DESIGN-{Math.random().toString(36).substr(2, 8).toUpperCase()}
      </p>
    </div>
  )
}
