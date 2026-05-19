'use client'

import Link from 'next/link'
import { ShoppingBag, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { routes } from '@/src/config/routes'
import { formatCurrencyMXN } from '@/src/lib/formatters'
import type { CartPreview, CartPreviewItem } from '@/src/types/cart'
import { MOCK_CART_PREVIEW } from '@/src/features/storefront/cart/mocks/cart-preview.mock'

// TODO: Reemplazar MOCK_CART_PREVIEW por useCartQuery cuando TanStack Query esté conectado.
// TODO: Conectar removeItem/updateQuantity cuando exista mutation.
// TODO: Conectar design preview real cuando el customizador guarde previews.
// TODO: Conectar subtotal real desde backend para evitar inconsistencias.

type CartPopoverProps = {
  cart?: CartPreview
  triggerClassName?: string
}

function CartTriggerBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}

/**
 * Returns the line total for a cart preview item (unit + customization × qty).
 */
export function getCartPreviewLineTotal(item: CartPreviewItem): number {
  const customization = item.customizationPrice ?? 0
  return (item.unitPrice + customization) * item.quantity
}

/**
 * Formats item count copy for the popover header badge.
 */
export function formatCartItemCountLabel(count: number): string {
  if (count === 1) return '1 artículo'
  return `${count} artículos`
}

function CartPopoverItem({ item }: { item: CartPreviewItem }) {
  const lineTotal = getCartPreviewLineTotal(item)

  return (
    <li className="rounded-lg border border-border bg-card p-3">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-sans text-sm font-semibold leading-snug text-foreground">
              {item.productName}
            </p>
            <p className="flex-shrink-0 font-sans text-sm font-semibold text-foreground">
              {formatCurrencyMXN(lineTotal)}
            </p>
          </div>

          <p className="mt-1 font-serif text-xs text-muted-foreground">
            Talla {item.size} · {item.colorName} · Cant. {item.quantity}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: item.colorHex }}
              aria-hidden
            />
            {item.isCustomized && (
              <Badge variant="secondary" className="gap-1 font-sans text-[10px]">
                <Sparkles className="h-3 w-3" />
                Personalizado
              </Badge>
            )}
          </div>

          {item.isCustomized && (
            <div className="mt-2 space-y-1 rounded-md bg-secondary/50 px-2.5 py-2">
              {item.designId && (
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {item.designId}
                </p>
              )}
              {item.customizationSummary && (
                <ul className="space-y-0.5 font-serif text-xs text-muted-foreground">
                  {item.customizationSummary.hasLogo && <li>Logo</li>}
                  {item.customizationSummary.hasEmbroidery && <li>Bordado</li>}
                  {item.customizationSummary.embroideredName && (
                    <li>&quot;{item.customizationSummary.embroideredName}&quot;</li>
                  )}
                  {item.customizationSummary.areas && item.customizationSummary.areas.length > 0 && (
                    <li>Áreas: {item.customizationSummary.areas.join(', ')}</li>
                  )}
                </ul>
              )}
              <Link
                href={routes.customize}
                className="mt-1 inline-block font-sans text-xs font-medium text-primary hover:underline"
              >
                Editar diseño
              </Link>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

function CartPopoverEmpty() {
  return (
    <div className="px-1 py-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-sans text-sm font-semibold text-foreground">
        Tu carrito está vacío
      </h3>
      <p className="mt-2 font-serif text-sm text-muted-foreground">
        Explora la tienda o diseña tu uniforme personalizado.
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Button className="w-full font-sans" asChild>
          <Link href={routes.shop}>Ir a tienda</Link>
        </Button>
        <Button variant="outline" className="w-full font-sans" asChild>
          <Link href={routes.customize}>Diseñar uniforme</Link>
        </Button>
      </div>
    </div>
  )
}

function CartPopoverContent({ cart }: { cart: CartPreview }) {
  const hasItems = cart.items.length > 0
  const partialTotal = cart.subtotal + cart.customizationTotal

  if (!hasItems) {
    return <CartPopoverEmpty />
  }

  return (
    <>
      <ul className="max-h-[min(320px,50vh)] space-y-3 overflow-y-auto pr-1">
        {cart.items.map((item) => (
          <CartPopoverItem key={item.id} item={item} />
        ))}
      </ul>

      <Separator className="my-4" />

      <div className="space-y-2 font-serif text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal productos</span>
          <span>{formatCurrencyMXN(cart.subtotal)}</span>
        </div>
        {cart.customizationTotal > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Personalización</span>
            <span>{formatCurrencyMXN(cart.customizationTotal)}</span>
          </div>
        )}
        <div className="flex justify-between font-sans font-semibold text-foreground">
          <span>Total parcial</span>
          <span>{formatCurrencyMXN(partialTotal)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Button className="w-full font-sans font-semibold" asChild>
          <Link href={routes.checkout}>Finalizar compra</Link>
        </Button>
        <Button variant="outline" className="w-full font-sans" asChild>
          <Link href={routes.cart}>Ver carrito</Link>
        </Button>
      </div>

      <p className="mt-3 text-center font-serif text-[11px] leading-relaxed text-muted-foreground">
        El costo final se confirma antes del pago.
      </p>
    </>
  )
}

export function CartPopover({ cart = MOCK_CART_PREVIEW, triggerClassName }: CartPopoverProps) {
  const itemCount = cart.totalItems

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative h-9 w-9', triggerClassName)}
          aria-label={`Carrito (${itemCount} productos)`}
        >
          <ShoppingBag className="h-4 w-4" />
          <CartTriggerBadge count={itemCount} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-sans text-base font-semibold text-foreground">Tu carrito</h2>
              <p className="mt-0.5 font-serif text-xs text-muted-foreground">
                Vista rápida de tus prendas seleccionadas
              </p>
            </div>
            {itemCount > 0 && (
              <Badge variant="secondary" className="shrink-0 font-sans text-[11px]">
                {formatCartItemCountLabel(itemCount)}
              </Badge>
            )}
          </div>
        </div>

        <div className="px-4 py-4">
          <CartPopoverContent cart={cart} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
