'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CartItemCard,
  OrderSummary,
  EmptyCartState,
  StickyCheckoutBar,
} from '@/src/features/storefront/cart'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import { formatCurrencyMXN } from '@/src/lib/formatters'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import type { CartPageState } from '@/src/types/cart'
import { MOCK_CART_PAGE } from '@/src/features/storefront/cart/mocks/cart.mock'
import {
  buildCartPageState,
  computeCartTotals,
  FREE_SHIPPING_THRESHOLD_MXN,
  getFreeShippingRemaining,
  removeCartPreviewItem,
  updateCartPreviewItemQuantity,
} from '@/src/features/storefront/cart/lib/cart-utils'

// TODO: Reemplazar MOCK_CART_PAGE por useCartQuery cuando TanStack Query esté conectado.
// TODO: Conectar updateQuantity con mutation real.
// TODO: Conectar removeItem con mutation real.
// TODO: Conectar previews reales del customizador.
// TODO: Tomar totales desde backend.

export default function CartPage() {
  const [cart, setCart] = useState<CartPageState>(MOCK_CART_PAGE)

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCart((prev) =>
      buildCartPageState(updateCartPreviewItemQuantity(prev.items, itemId, quantity)),
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => buildCartPageState(removeCartPreviewItem(prev.items, itemId)))
  }

  const { partialTotal } = computeCartTotals(cart.items)
  const freeShippingRemaining = getFreeShippingRemaining(partialTotal)
  const hasItems = cart.items.length > 0

  return (
    <>
      <div className="min-h-screen bg-background pb-32 lg:pb-16">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Link href={routes.shop}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continuar comprando
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-sans text-2xl font-bold text-foreground md:text-3xl">
                  Tu carrito
                </h1>
                <p className="font-serif text-muted-foreground">
                  Revisa tus prendas, diseños personalizados y costos antes de continuar.
                </p>
              </div>
            </div>
          </div>

          {!hasItems && <EmptyCartState />}

          {hasItems && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}

                {freeShippingRemaining > 0 && (
                  <div className="rounded-lg border border-border bg-secondary/50 p-4">
                    <p className="font-serif text-sm text-muted-foreground">
                      Agrega{' '}
                      <span className="font-sans font-semibold text-accent">
                        {formatCurrencyMXN(freeShippingRemaining)}
                      </span>{' '}
                      más para obtener{' '}
                      <span className="font-sans font-semibold text-success">envío gratis</span>
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full bg-success transition-all duration-300"
                        style={{
                          width: `${Math.min((partialTotal / FREE_SHIPPING_THRESHOLD_MXN) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <OrderSummary
                    subtotal={cart.subtotal}
                    customizationTotal={cart.customizationTotal}
                    shipping={cart.shipping}
                    itemCount={cart.totalItems}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasItems && (
        <StickyCheckoutBar total={cart.total} itemCount={cart.totalItems} />
      )}
    </>
  )
}
