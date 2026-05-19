'use client'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, CreditCard, Building2, Banknote, Palette } from 'lucide-react'
import type { Cart } from '@/lib/types'

interface CheckoutOrderSummaryProps {
  cart: Cart
  discount?: {
    code: string
    amount: number
  }
  shippingCost: number
  className?: string
}

export function CheckoutOrderSummary({ 
  cart, 
  discount,
  shippingCost,
  className 
}: CheckoutOrderSummaryProps) {
  // Calculate totals
  const baseTotal = cart.items.reduce((sum, item) => {
    const basePrice = item.product.price * item.customization.quantity
    return sum + basePrice
  }, 0)

  const customizationTotal = cart.items.reduce((sum, item) => {
    const customPrice = item.customization.embroidery ? 199 * item.customization.quantity : 0
    return sum + customPrice
  }, 0)

  const subtotal = baseTotal + customizationTotal
  const finalShipping = subtotal >= 2000 ? 0 : shippingCost
  const discountAmount = discount?.amount || 0
  const total = subtotal + finalShipping - discountAmount

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card',
      className
    )}>
      <div className="p-4 md:p-6">
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Resumen del pedido
        </h2>

        {/* Product List */}
        <div className="mt-4 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {/* Product Image */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                {item.product.images[0] && (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <span className="font-sans text-xs">IMG</span>
                  </div>
                )}
                {/* Custom Design Badge */}
                {item.customization.embroidery && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Palette className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-sans text-sm font-medium text-foreground line-clamp-1">
                  {item.product.name}
                </h3>
                <p className="font-serif text-xs text-muted-foreground">
                  {item.customization.selectedSize} / {
                    item.product.colors.find(c => c.id === item.customization.selectedColor)?.name
                  }
                </p>
                <p className="font-serif text-xs text-muted-foreground">
                  Cant: {item.customization.quantity}
                </p>
                {item.customization.embroidery && (
                  <p className="font-serif text-xs text-accent">
                    + Personalizacion
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-sans text-sm font-medium text-foreground">
                  ${item.subtotal.toLocaleString('es-MX')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-serif text-sm">
            <span className="text-muted-foreground">Subtotal productos</span>
            <span className="font-sans text-foreground">
              ${baseTotal.toLocaleString('es-MX')} MXN
            </span>
          </div>

          {customizationTotal > 0 && (
            <div className="flex items-center justify-between font-serif text-sm">
              <span className="text-muted-foreground">Personalizaciones</span>
              <span className="font-sans text-accent">
                +${customizationTotal.toLocaleString('es-MX')} MXN
              </span>
            </div>
          )}

          <div className="flex items-center justify-between font-serif text-sm">
            <span className="text-muted-foreground">Envio</span>
            <span className="font-sans text-foreground">
              {finalShipping === 0 ? (
                <span className="text-success">Gratis</span>
              ) : (
                `$${finalShipping.toLocaleString('es-MX')} MXN`
              )}
            </span>
          </div>

          {discount && (
            <div className="flex items-center justify-between font-serif text-sm">
              <span className="text-success">Descuento ({discount.code})</span>
              <span className="font-sans text-success">
                -${discount.amount.toLocaleString('es-MX')} MXN
              </span>
            </div>
          )}

          <div className="flex items-center justify-between font-serif text-sm text-muted-foreground">
            <span>Impuestos</span>
            <span className="font-sans">Incluidos</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="font-sans text-lg font-semibold text-foreground">Total a pagar</span>
          <span className="font-sans text-2xl font-bold text-foreground">
            ${total.toLocaleString('es-MX')} MXN
          </span>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="font-serif">Transaccion 100% segura</span>
        </div>

        {/* Payment Methods */}
        <div className="mt-4">
          <p className="mb-2 text-center font-serif text-xs text-muted-foreground">
            Metodos de pago
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-sans text-xs font-medium text-foreground">Tarjeta</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-sans text-xs font-medium text-foreground">OXXO</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="font-sans text-xs font-medium text-foreground">SPEI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
