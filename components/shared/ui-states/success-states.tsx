'use client'
import { routes } from '@/src/config/routes'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Save, ShoppingCart, Copy, ExternalLink, Download } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Order Success State
interface OrderSuccessStateProps {
  orderNumber: string
  email?: string
  estimatedDelivery?: string
  onViewOrder?: () => void
  onContinueShopping?: () => void
  className?: string
}

export function OrderSuccessState({
  orderNumber,
  email,
  estimatedDelivery,
  onViewOrder,
  onContinueShopping,
  className,
}: OrderSuccessStateProps) {
  return (
    <Card className={cn('border-success/30 bg-card', className)}>
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-success/10 p-4">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="font-sans text-2xl font-bold text-foreground">Pedido confirmado</h2>
          <p className="mt-2 font-serif text-muted-foreground">Gracias por tu compra</p>

          <div className="mt-6 rounded-lg bg-secondary px-6 py-4">
            <p className="font-sans text-sm text-muted-foreground">Numero de pedido</p>
            <p className="font-mono text-xl font-bold text-foreground">{orderNumber}</p>
          </div>

          {email && (
            <p className="mt-4 font-serif text-sm text-muted-foreground">
              Enviamos la confirmacion a <strong className="text-foreground">{email}</strong>
            </p>
          )}

          {estimatedDelivery && (
            <p className="mt-2 font-serif text-sm text-muted-foreground">
              Entrega estimada: <strong className="text-foreground">{estimatedDelivery}</strong>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={onViewOrder} asChild={!onViewOrder}>
              {onViewOrder ? (
                'Ver mi pedido'
              ) : (
                <Link href={`${routes.account}/orders`}>Ver mi pedido</Link>
              )}
            </Button>
            <Button variant="outline" onClick={onContinueShopping} asChild={!onContinueShopping}>
              {onContinueShopping ? (
                'Seguir comprando'
              ) : (
                <Link href={routes.shop}>Seguir comprando</Link>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Design Saved State
interface DesignSavedStateProps {
  designName: string
  designId: string
  onViewDesign?: () => void
  onContinueEditing?: () => void
  onAddToCart?: () => void
  className?: string
}

export function DesignSavedState({
  designName,
  designId,
  onViewDesign,
  onContinueEditing,
  onAddToCart,
  className,
}: DesignSavedStateProps) {
  return (
    <Card className={cn('border-success/30 bg-card', className)}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-success/10 p-4">
            <Save className="h-8 w-8 text-success" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-foreground">Diseno guardado</h3>
          <p className="mt-2 font-serif text-muted-foreground">
            Tu diseno &quot;{designName}&quot; ha sido guardado exitosamente.
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">ID: {designId}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onAddToCart && (
              <Button onClick={onAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al carrito
              </Button>
            )}
            {onContinueEditing && (
              <Button variant="outline" onClick={onContinueEditing}>
                Seguir editando
              </Button>
            )}
            {onViewDesign && (
              <Button variant="ghost" onClick={onViewDesign}>
                Ver en mis disenos
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Added to Cart State
interface AddedToCartStateProps {
  productName: string
  productImage?: string
  quantity: number
  price: number
  onViewCart?: () => void
  onContinueShopping?: () => void
  className?: string
}

export function AddedToCartState({
  productName,
  productImage,
  quantity,
  price,
  onViewCart,
  onContinueShopping,
  className,
}: AddedToCartStateProps) {
  return (
    <Card className={cn('border-success/30 bg-card', className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-success/10 p-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-sans font-semibold text-foreground">Agregado al carrito</h3>

            <div className="mt-3 flex items-center gap-3">
              {productImage ? (
                <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-foreground truncate">
                  {productName}
                </p>
                <p className="font-serif text-sm text-muted-foreground">Cantidad: {quantity}</p>
                <p className="font-sans font-semibold text-foreground">
                  ${price.toLocaleString('es-MX')} MXN
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={onViewCart} asChild={!onViewCart}>
                {onViewCart ? 'Ver carrito' : <Link href={routes.cart}>Ver carrito</Link>}
              </Button>
              <Button size="sm" variant="outline" onClick={onContinueShopping}>
                Seguir comprando
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Payment Reference Generated State
interface PaymentReferenceGeneratedStateProps {
  paymentMethod: 'oxxo' | 'spei'
  reference: string
  amount: number
  expiresAt: string
  barcode?: string
  onCopyReference?: () => void
  onDownloadVoucher?: () => void
  className?: string
}

export function PaymentReferenceGeneratedState({
  paymentMethod,
  reference,
  amount,
  expiresAt,
  barcode,
  onCopyReference,
  onDownloadVoucher,
  className,
}: PaymentReferenceGeneratedStateProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(reference)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopyReference?.()
  }

  const isOxxo = paymentMethod === 'oxxo'

  return (
    <Card className={cn('border-primary/30 bg-card', className)}>
      <CardContent className="py-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-foreground">
            {isOxxo ? 'Referencia OXXO generada' : 'Datos SPEI generados'}
          </h3>
          <p className="mt-2 font-serif text-muted-foreground">
            {isOxxo
              ? 'Presenta esta referencia en cualquier OXXO para completar tu pago.'
              : 'Realiza la transferencia SPEI a los siguientes datos.'}
          </p>

          {/* Reference */}
          <div className="mt-6 w-full max-w-sm">
            <p className="font-sans text-sm text-muted-foreground mb-2">
              {isOxxo ? 'Referencia de pago' : 'CLABE'}
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-3">
              <span className="flex-1 font-mono text-lg font-bold text-foreground">
                {reference}
              </span>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                <span className="ml-2 sr-only sm:not-sr-only">{copied ? 'Copiado' : 'Copiar'}</span>
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="mt-4 w-full max-w-sm">
            <p className="font-sans text-sm text-muted-foreground mb-1">Monto a pagar</p>
            <p className="font-sans text-2xl font-bold text-foreground">
              ${amount.toLocaleString('es-MX')} MXN
            </p>
          </div>

          {/* Barcode (OXXO) */}
          {isOxxo && barcode && (
            <div className="mt-4 rounded-lg bg-white p-4">
              <div className="h-16 w-48 bg-secondary flex items-center justify-center">
                <span className="font-mono text-xs text-muted-foreground">[Codigo de barras]</span>
              </div>
            </div>
          )}

          {/* Expiration */}
          <p className="mt-4 font-serif text-sm text-warning">Expira: {expiresAt}</p>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onDownloadVoucher && (
              <Button variant="outline" onClick={onDownloadVoucher}>
                <Download className="mr-2 h-4 w-4" />
                Descargar ficha
              </Button>
            )}
            <Button variant="ghost" asChild>
              <Link href={`${routes.account}/orders`}>
                Ver mis pedidos
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
