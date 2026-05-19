'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CartItemCard, 
  OrderSummary, 
  EmptyCartState, 
  CartSkeleton, 
  CartErrorState,
  StickyCheckoutBar 
} from '@/src/features/storefront/cart'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { MOCK_CART, updateCartItemQuantity, removeCartItem } from '@/lib/mock-data'
import type { Cart } from '@/lib/types'

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TODO: Replace with TanStack Query useQuery
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 600))
        setCart(MOCK_CART)
      } catch {
        setError('No pudimos cargar tu carrito')
      } finally {
        setIsLoading(false)
      }
    }
    loadCart()
  }, [])

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return
    
    // Optimistic update
    const optimisticItems = cart.items.map(item => {
      if (item.id === itemId) {
        const basePrice = item.product.price
        const customizationPrice = item.customization.embroidery ? 199 : 0
        return {
          ...item,
          customization: { ...item.customization, quantity },
          subtotal: (basePrice + customizationPrice) * quantity,
        }
      }
      return item
    })
    const optimisticSubtotal = optimisticItems.reduce((sum, item) => sum + item.subtotal, 0)
    setCart({
      ...cart,
      items: optimisticItems,
      subtotal: optimisticSubtotal,
      total: optimisticSubtotal >= 2000 ? optimisticSubtotal : optimisticSubtotal + 199,
      shipping: optimisticSubtotal >= 2000 ? 0 : 199,
    })

    // TODO: Replace with TanStack Query mutation
    try {
      const updatedCart = await updateCartItemQuantity(itemId, quantity)
      setCart(updatedCart)
    } catch {
      // Revert on error
      setCart(cart)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!cart) return
    
    // Optimistic update
    const optimisticItems = cart.items.filter(item => item.id !== itemId)
    const optimisticSubtotal = optimisticItems.reduce((sum, item) => sum + item.subtotal, 0)
    setCart({
      ...cart,
      items: optimisticItems,
      subtotal: optimisticSubtotal,
      total: optimisticSubtotal >= 2000 ? optimisticSubtotal : optimisticSubtotal + 199,
      shipping: optimisticSubtotal >= 2000 ? 0 : 199,
    })

    // TODO: Replace with TanStack Query mutation
    try {
      const updatedCart = await removeCartItem(itemId)
      setCart(updatedCart)
    } catch {
      // Revert on error
      setCart(cart)
    }
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Retry logic
    setTimeout(() => {
      setCart(MOCK_CART)
      setIsLoading(false)
    }, 600)
  }

  // Calculate totals for summary
  const customizationTotal = cart?.items.reduce((sum, item) => {
    return sum + (item.customization.embroidery ? 199 * item.customization.quantity : 0)
  }, 0) || 0

  const productSubtotal = cart?.items.reduce((sum, item) => {
    return sum + (item.product.price * item.customization.quantity)
  }, 0) || 0

  return (
    <>
    <div className="min-h-screen bg-background pb-32 lg:pb-16">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Link href="/shop">
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
                  Revisa tus prendas, disenos personalizados y costos antes de continuar.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading && <CartSkeleton itemCount={2} />}

          {error && !isLoading && (
            <CartErrorState message={error} onRetry={handleRetry} />
          )}

          {!isLoading && !error && cart?.items.length === 0 && (
            <EmptyCartState />
          )}

          {!isLoading && !error && cart && cart.items.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="space-y-4 lg:col-span-2">
                {cart.items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}

                {/* Free Shipping Progress */}
                {cart.subtotal < 2000 && (
                  <div className="rounded-lg border border-border bg-secondary/50 p-4">
                    <p className="font-serif text-sm text-muted-foreground">
                      Agrega{' '}
                      <span className="font-sans font-semibold text-accent">
                        ${(2000 - cart.subtotal).toLocaleString('es-MX')} MXN
                      </span>{' '}
                      mas para obtener{' '}
                      <span className="font-sans font-semibold text-success">envio gratis</span>
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                      <div 
                        className="h-full bg-success transition-all duration-300"
                        style={{ width: `${Math.min((cart.subtotal / 2000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <OrderSummary
                    subtotal={productSubtotal}
                    customizationTotal={customizationTotal}
                    shipping={cart.shipping}
                    itemCount={cart.items.reduce((sum, item) => sum + item.customization.quantity, 0)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      {!isLoading && !error && cart && cart.items.length > 0 && (
        <StickyCheckoutBar 
          total={cart.total} 
          itemCount={cart.items.reduce((sum, item) => sum + item.customization.quantity, 0)}
        />
      )}
    </>
  )
}
