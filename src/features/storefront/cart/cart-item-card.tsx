'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, Trash2, Palette } from 'lucide-react'
import { routes } from '@/src/config/routes'
import { formatCurrencyMXN } from '@/src/lib/formatters'
import type { CartPreviewItem } from '@/src/types/cart'
import {
  CART_CATEGORY_LABELS,
  getCartPreviewLineTotal,
} from '@/src/features/storefront/cart/lib/cart-utils'
import { CartProductThumbnail } from '@/src/features/storefront/cart/components/cart-product-thumbnail'
import { CartCustomizationSummary } from '@/src/features/storefront/cart/components/cart-customization-summary'

interface CartItemCardProps {
  item: CartPreviewItem
  onUpdateQuantity: (id: string, quantity: number) => void | Promise<void>
  onRemove: (id: string) => void | Promise<void>
  isUpdating?: boolean
  className?: string
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  className,
}: CartItemCardProps) {
  const lineTotal = getCartPreviewLineTotal(item)
  const customizationUnit = item.customizationPrice ?? 0

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta
    if (newQuantity < 1 || newQuantity > 10 || isUpdating) return
    void onUpdateQuantity(item.id, newQuantity)
  }

  return (
    <div
      data-testid="cart-item-card"
      className={cn(
        'rounded-lg border border-border bg-card p-4 md:p-6',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-shrink-0">
          <CartProductThumbnail
            productName={item.productName}
            category={item.category}
            imageUrl={item.imageUrl}
            colorHex={item.colorHex}
            className="h-32 w-32 sm:h-36 sm:w-36"
          />
          {item.isCustomized && (
            <div className="absolute left-2 top-2">
              <Badge className="gap-1 bg-accent text-white" data-testid="cart-custom-design-badge">
                <Palette className="h-3 w-3" />
                Personalizado
              </Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {CART_CATEGORY_LABELS[item.category]}
              </p>
              <Link
                href={routes.productDetail(item.productSlug)}
                className="font-sans text-lg font-semibold text-foreground hover:text-accent"
              >
                {item.productName}
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => void onRemove(item.id)}
              disabled={isUpdating}
              aria-label={`Eliminar ${item.productName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5" data-testid="cart-item-selected-size">
              <span className="font-serif">Talla:</span>
              <span className="font-sans font-medium text-foreground">{item.size}</span>
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5" data-testid="cart-item-selected-fabric-color">
              <span className="font-serif">Tela:</span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block h-4 w-4 rounded-full border border-border"
                  style={{ backgroundColor: item.colorHex }}
                  aria-hidden
                />
                <span className="font-sans font-medium text-foreground">
                  {item.colorName}
                </span>
              </span>
            </span>
            {item.detailColorName ? (
              <>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1.5" data-testid="cart-item-selected-detail-color">
                  <span className="font-serif">Detalle:</span>
                  <span className="flex items-center gap-1">
                    {item.detailColorHex ? (
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: item.detailColorHex }}
                        aria-hidden
                      />
                    ) : null}
                    <span className="font-sans font-medium text-foreground">
                      {item.detailColorName}
                    </span>
                  </span>
                </span>
              </>
            ) : null}
          </div>

          {item.isCustomized && (
            <CartCustomizationSummary
              className="mt-3 rounded-lg bg-secondary/50 p-3"
              designId={item.designId}
              summary={item.customizationSummary}
              showEditLink
            />
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm text-muted-foreground">Cantidad:</span>
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-r-none"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={item.quantity <= 1 || isUpdating}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center font-sans font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-l-none"
                  onClick={() => handleQuantityChange(1)}
                  disabled={item.quantity >= 10 || isUpdating}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-0.5 text-sm text-muted-foreground">
                <p>
                  <span className="font-serif">Base:</span>{' '}
                  <span className="font-sans">{formatCurrencyMXN(item.unitPrice)}</span>
                </p>
                {customizationUnit > 0 && (
                  <p>
                    <span className="font-serif">Personalización:</span>{' '}
                    <span className="font-sans text-accent">
                      +{formatCurrencyMXN(customizationUnit)}
                    </span>
                  </p>
                )}
              </div>
              <p className="mt-1 font-sans text-xl font-bold text-foreground">
                {formatCurrencyMXN(lineTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
