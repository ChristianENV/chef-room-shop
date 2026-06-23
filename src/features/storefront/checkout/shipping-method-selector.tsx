'use client'

import { cn } from '@/lib/utils'
import { Clock, Truck, Zap } from 'lucide-react'

export type ShippingMethod = 'standard' | 'express'

interface ShippingOption {
  id: ShippingMethod
  name: string
  description: string
  price: number
  estimatedDays: string
  icon: React.ReactNode
  available: boolean
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Produccion estandar',
    description: 'Tiempo de produccion regular mas envio nacional',
    price: 0, // Free over $2000
    estimatedDays: '10-15 dias habiles',
    icon: <Truck className="h-5 w-5" />,
    available: true,
  },
  {
    id: 'express',
    name: 'Produccion express',
    description: 'Produccion prioritaria para entregas urgentes',
    price: 499,
    estimatedDays: '5-7 dias habiles',
    icon: <Zap className="h-5 w-5" />,
    available: false, // Placeholder - not yet available
  },
]

interface ShippingMethodSelectorProps {
  selectedMethod: ShippingMethod
  onMethodChange: (method: ShippingMethod) => void
  hasCustomization: boolean
  className?: string
}

export function ShippingMethodSelector({
  selectedMethod,
  onMethodChange,
  hasCustomization,
  className,
}: ShippingMethodSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Metodo de produccion y envio
        </h2>
      </div>

      {hasCustomization && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
          <p className="font-serif text-sm text-warning">
            Tu pedido incluye productos personalizados. El tiempo de produccion es adicional al
            tiempo de envio.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {SHIPPING_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => option.available && onMethodChange(option.id)}
            disabled={!option.available}
            className={cn(
              'relative flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors',
              selectedMethod === option.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50',
              !option.available && 'cursor-not-allowed opacity-50',
            )}
          >
            {/* Radio Circle */}
            <div
              className={cn(
                'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                selectedMethod === option.id
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground',
              )}
            >
              {selectedMethod === option.id && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0',
                selectedMethod === option.id ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {option.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-foreground">{option.name}</span>
                <span className="font-sans font-semibold text-foreground">
                  {option.price === 0 ? (
                    <span className="text-success">Gratis</span>
                  ) : (
                    `+$${option.price.toLocaleString('es-MX')} MXN`
                  )}
                </span>
              </div>
              <p className="mt-1 font-serif text-sm text-muted-foreground">{option.description}</p>
              <p className="mt-1 font-serif text-xs text-muted-foreground">
                Tiempo estimado: {option.estimatedDays}
              </p>
            </div>

            {/* Coming Soon Badge */}
            {!option.available && (
              <span className="absolute right-4 top-4 rounded-full bg-secondary px-2 py-0.5 font-sans text-xs font-medium text-muted-foreground">
                Proximamente
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Production Time Info */}
      <div className="rounded-lg bg-secondary/50 p-4">
        <h3 className="font-sans text-sm font-semibold text-foreground">Tiempos de produccion</h3>
        <ul className="mt-2 space-y-1 font-serif text-sm text-muted-foreground">
          <li>Productos estandar: 3-5 dias habiles</li>
          <li>Productos personalizados: 5-8 dias habiles adicionales</li>
          <li>El envio se realiza despues de la produccion</li>
        </ul>
      </div>
    </div>
  )
}
