'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CartItemCard,
  OrderSummary,
  EmptyCartState,
  StickyCheckoutBar,
  CartSkeleton,
  CartErrorState,
} from '@/src/features/storefront/cart'
import { useMyCartQuery } from '@/src/features/storefront/cart/api/use-my-cart-query'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { PremiumBenefitsNotice } from '@/src/features/storefront/account/components/premium-benefits-notice'
import { useUpdateCartItemQuantityMutation } from '@/src/features/storefront/cart/api/use-update-cart-item-quantity-mutation'
import { useRemoveCartItemMutation } from '@/src/features/storefront/cart/api/use-remove-cart-item-mutation'
import {
  getCartPageFreeShippingRemaining,
  mapBffCartToCartPage,
} from '@/src/features/storefront/cart/mappers/cart-ui.mapper'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import { formatCurrencyMXN, centsToPesos } from '@/src/lib/formatters'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD_MXN } from '@/src/features/storefront/cart/lib/cart-utils'

const GENERIC_ACTION_ERROR = 'No pudimos actualizar tu carrito. Por favor intenta de nuevo.'

export default function CartPage() {
  const { data, isLoading, isError, refetch, isFetching } = useMyCartQuery()
  const profileQuery = useMeProfileQuery()
  const updateQuantity = useUpdateCartItemQuantityMutation()
  const removeItem = useRemoveCartItemMutation()
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const cart = data ? mapBffCartToCartPage(data) : null
  const hasItems = (cart?.items.length ?? 0) > 0
  const partialTotalPesos = cart ? cart.subtotal + cart.customizationTotal : 0
  const freeShippingRemaining = data ? getCartPageFreeShippingRemaining(data) : 0

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setActionError(null)
    setPendingItemId(itemId)
    try {
      await updateQuantity.mutateAsync({ itemId, quantity })
    } catch {
      setActionError(GENERIC_ACTION_ERROR)
    } finally {
      setPendingItemId(null)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setActionError(null)
    setPendingItemId(itemId)
    try {
      await removeItem.mutateAsync(itemId)
    } catch {
      setActionError(GENERIC_ACTION_ERROR)
    } finally {
      setPendingItemId(null)
    }
  }

  const discount =
    data && data.discountTotalCents > 0
      ? { code: 'Descuento', amount: centsToPesos(data.discountTotalCents) }
      : undefined

  const isItemPending = (itemId: string) =>
    pendingItemId === itemId && (updateQuantity.isPending || removeItem.isPending)

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

          <PremiumBenefitsNotice customerTier={profileQuery.data?.customerTier} />

          {actionError ? (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 font-serif text-sm text-destructive">
              {actionError}
            </p>
          ) : null}

          {isLoading ? <CartSkeleton /> : null}

          {isError && !isLoading ? (
            <CartErrorState
              message="No pudimos cargar tu carrito. Por favor intenta de nuevo."
              onRetry={() => void refetch()}
            />
          ) : null}

          {!isLoading && !isError && cart && !hasItems ? <EmptyCartState /> : null}

          {!isLoading && !isError && cart && hasItems ? (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isUpdating={isItemPending(item.id)}
                  />
                ))}

                {freeShippingRemaining > 0 ? (
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
                          width: `${Math.min((partialTotalPesos / FREE_SHIPPING_THRESHOLD_MXN) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <OrderSummary
                    subtotal={cart.subtotal}
                    customizationTotal={cart.customizationTotal}
                    shipping={cart.shipping}
                    discount={discount}
                    itemCount={cart.totalItems}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {isFetching && !isLoading && hasItems ? (
            <p className="mt-4 text-center font-serif text-xs text-muted-foreground">
              Actualizando carrito?
            </p>
          ) : null}
        </div>
      </div>

      {cart && hasItems ? (
        <StickyCheckoutBar total={cart.total} itemCount={cart.totalItems} />
      ) : null}
    </>
  )
}
