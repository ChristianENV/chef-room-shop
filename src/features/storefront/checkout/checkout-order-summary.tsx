'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, CreditCard, Building2, Banknote, Palette } from 'lucide-react'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'

import type { SelectedShippingRateSummary } from './types/checkout-shipping.types'
import type { CheckoutSummaryData } from './mappers/checkout-ui.mapper'

interface CheckoutOrderSummaryProps {
  summary: CheckoutSummaryData
  selectedShipping?: SelectedShippingRateSummary | null
  className?: string
}

export function CheckoutOrderSummary({
  summary,
  selectedShipping,
  className,
}: CheckoutOrderSummaryProps) {
  const { items, subtotalPesos, customizationTotalPesos, discountPesos } = summary

  const shippingPesos = selectedShipping
    ? centsToPesos(selectedShipping.amountCents)
    : summary.shippingPesos

  const estimatedTotalPesos =
    subtotalPesos + customizationTotalPesos + shippingPesos - discountPesos

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <div className="p-4 md:p-6">
        <h2 className="font-sans text-lg font-semibold text-foreground">Resumen del pedido</h2>

        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <span className="font-sans text-xs">IMG</span>
                  </div>
                )}
                {item.isCustomized && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Palette className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="line-clamp-1 font-sans text-sm font-medium text-foreground">
                  {item.name}
                </h3>
                <p className="font-serif text-xs text-muted-foreground">
                  {item.sizeLabel} / {item.colorName}
                </p>
                <p className="font-serif text-xs text-muted-foreground">Cant: {item.quantity}</p>
                {item.isCustomized && (
                  <p className="font-serif text-xs text-accent">+ Personalización</p>
                )}
              </div>

              <div className="text-right">
                <p className="font-sans text-sm font-medium text-foreground">
                  {formatCurrencyMXN(item.lineTotalPesos)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex items-center justify-between font-serif text-sm">
            <span className="text-muted-foreground">Subtotal productos</span>
            <span className="font-sans text-foreground">{formatCurrencyMXN(subtotalPesos)}</span>
          </div>

          {customizationTotalPesos > 0 && (
            <div className="flex items-center justify-between font-serif text-sm">
              <span className="text-muted-foreground">Personalizaciones</span>
              <span className="font-sans text-accent">
                +{formatCurrencyMXN(customizationTotalPesos)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between font-serif text-sm">
            <span className="text-muted-foreground">
              {selectedShipping ? 'Envío seleccionado' : 'Envío'}
            </span>
            <span className="font-sans text-foreground">
              {selectedShipping ? (
                formatCurrencyMXN(shippingPesos)
              ) : shippingPesos === 0 ? (
                <span className="text-muted-foreground">Por cotizar</span>
              ) : (
                formatCurrencyMXN(shippingPesos)
              )}
            </span>
          </div>

          {selectedShipping && (
            <p className="font-serif text-xs text-muted-foreground">
              {selectedShipping.carrier}
              {selectedShipping.service ? ` · ${selectedShipping.service}` : ''}
            </p>
          )}

          {discountPesos > 0 && (
            <div className="flex items-center justify-between font-serif text-sm">
              <span className="text-success">Descuento</span>
              <span className="font-sans text-success">-{formatCurrencyMXN(discountPesos)}</span>
            </div>
          )}

          <div className="flex items-center justify-between font-serif text-sm text-muted-foreground">
            <span>Impuestos</span>
            <span className="font-sans">Por calcular</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <span className="font-sans text-lg font-semibold text-foreground">Total</span>
          <span className="font-sans text-2xl font-bold text-foreground">
            {formatCurrencyMXN(estimatedTotalPesos)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span className="font-serif text-center">
            {selectedShipping
              ? 'El total incluye el envío seleccionado y se confirmará al crear el pedido.'
              : 'Selecciona un envío para ver el total con paquetería.'}
          </span>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-center font-serif text-xs text-muted-foreground">
            Métodos de pago
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
