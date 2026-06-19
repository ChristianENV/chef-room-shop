'use client'
import { routes } from '@/src/config/routes'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Building2,
  Banknote,
  Tag,
  Loader2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface OrderSummaryProps {
  subtotal: number
  customizationTotal: number
  shipping: number
  discount?: {
    code: string
    amount: number
  }
  itemCount: number
  className?: string
}

export function OrderSummary({
  subtotal,
  customizationTotal,
  shipping,
  discount,
  itemCount,
  className,
}: OrderSummaryProps) {
  const [isOpen, setIsOpen] = useState(true)
  const total = subtotal + customizationTotal + shipping - (discount?.amount || 0)

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Mobile Collapsible Header */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between p-4 md:hidden">
            <span className="font-sans font-semibold text-foreground">Resumen del pedido</span>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-foreground">
                {formatCurrencyMXN(total)}
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="md:block">
          <div className="p-4 pt-0 md:p-6 md:pt-6">
            {/* Desktop Header */}
            <h2 className="mb-4 hidden font-sans text-lg font-semibold text-foreground md:block">
              Resumen del pedido
            </h2>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-serif text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({itemCount} {itemCount === 1 ? 'artículo' : 'artículos'})
                </span>
                <span className="font-sans text-foreground">{formatCurrencyMXN(subtotal)}</span>
              </div>

              {customizationTotal > 0 && (
                <div className="flex items-center justify-between font-serif text-sm">
                  <span className="text-muted-foreground">Total personalizacion</span>
                  <span className="font-sans text-accent">
                    +{formatCurrencyMXN(customizationTotal)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between font-serif text-sm">
                <span className="text-muted-foreground">Envio estimado</span>
                <span className="font-sans text-foreground">
                  {shipping === 0 ? (
                    <span className="text-success">Gratis</span>
                  ) : (
                    formatCurrencyMXN(shipping)
                  )}
                </span>
              </div>

              {discount && (
                <div className="flex items-center justify-between font-serif text-sm">
                  <span className="flex items-center gap-1.5 text-success">
                    <Tag className="h-3 w-3" />
                    {discount.code}
                  </span>
                  <span className="font-sans text-success">
                    -{formatCurrencyMXN(discount.amount)}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Discount Code Input */}
            <DiscountCodeInput />

            <Separator className="my-4" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-lg font-semibold text-foreground">Total</span>
              <span className="font-sans text-2xl font-bold text-foreground">
                {formatCurrencyMXN(total)}
              </span>
            </div>

            <p className="mt-3 text-center font-serif text-[11px] leading-relaxed text-muted-foreground">
              El costo final se confirma antes del pago.
            </p>

            {/* Checkout CTA */}
            <Button
              size="lg"
              className="mt-6 w-full bg-primary font-sans text-lg font-semibold hover:bg-primary/90"
              asChild
            >
              <Link href={routes.checkout}>Continuar al checkout</Link>
            </Button>

            {/* Security Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span className="font-serif">Pago 100% seguro</span>
            </div>

            {/* Payment Methods */}
            <div className="mt-4">
              <p className="mb-2 text-center font-serif text-xs text-muted-foreground">
                Metodos de pago aceptados
              </p>
              <div className="flex items-center justify-center gap-3">
                <PaymentBadge icon={<CreditCard className="h-4 w-4" />} label="Tarjeta" />
                <PaymentBadge icon={<Building2 className="h-4 w-4" />} label="OXXO" />
                <PaymentBadge icon={<Banknote className="h-4 w-4" />} label="SPEI" />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// Discount Code Input Component
function DiscountCodeInput() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleApply = async () => {
    if (!code.trim()) return

    setIsLoading(true)
    // TODO: Integrate with TanStack Query mutation for applyDiscount
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock: Accept "CHEF20" as valid code
    if (code.toUpperCase() === 'CHEF20') {
      setStatus('success')
    } else {
      setStatus('error')
    }
    setIsLoading(false)
  }

  const handleReset = () => {
    setCode('')
    setStatus('idle')
  }

  return (
    <div>
      <label className="mb-2 block font-serif text-sm text-muted-foreground">
        Codigo de descuento
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              if (status !== 'idle') setStatus('idle')
            }}
            placeholder="Ingresa tu codigo"
            className={cn(
              'font-sans uppercase',
              status === 'success' && 'border-success',
              status === 'error' && 'border-destructive',
            )}
            disabled={isLoading || status === 'success'}
          />
          {status === 'success' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Check className="h-4 w-4 text-success" />
            </div>
          )}
        </div>
        {status === 'success' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" onClick={handleApply} disabled={!code.trim() || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
          </Button>
        )}
      </div>
      {status === 'error' && (
        <p className="mt-1.5 font-serif text-xs text-destructive">Codigo invalido o expirado</p>
      )}
      {status === 'success' && (
        <p className="mt-1.5 font-serif text-xs text-success">Descuento aplicado correctamente</p>
      )}
    </div>
  )
}

// Payment Badge Component
function PaymentBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-sans text-xs font-medium text-foreground">{label}</span>
    </div>
  )
}
