'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyMXN, centsToPesos } from '@/src/lib/formatters'

import type { ShippingRate } from '../types'

type ShippingRateCardProps = {
  rate: ShippingRate
  selected: boolean
  isRecommended: boolean
  isCheapest: boolean
  disabled?: boolean
  onSelect: () => void
}

function formatEstimatedDays(days: number | null): string {
  if (days == null) return 'Tiempo por confirmar'
  if (days <= 1) return '1 día hábil estimado'
  return `${days} días hábiles estimados`
}

export function ShippingRateCard({
  rate,
  selected,
  isRecommended,
  isCheapest,
  disabled,
  onSelect,
}: ShippingRateCardProps) {
  const pricePesos = centsToPesos(rate.amountCents)

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/50',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <div
        className={cn(
          'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-primary bg-primary' : 'border-muted-foreground',
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-base font-semibold text-foreground">
            {rate.carrier}
          </span>
          {isRecommended && (
            <Badge className="bg-primary font-sans text-xs hover:bg-primary/90">
              Recomendado
            </Badge>
          )}
          {isCheapest && !isRecommended && (
            <Badge variant="secondary" className="font-sans text-xs">
              Más económico
            </Badge>
          )}
          {selected && (
            <Badge variant="outline" className="border-primary font-sans text-xs text-primary">
              Seleccionado
            </Badge>
          )}
        </div>

        {rate.service && (
          <p className="mt-1 font-serif text-sm text-muted-foreground">{rate.service}</p>
        )}

        <p className="mt-2 font-serif text-xs text-muted-foreground">
          {formatEstimatedDays(rate.estimatedDays)}
        </p>

        <p className="mt-2 font-serif text-xs text-muted-foreground">
          Tarifa calculada con tu carrito actual.
        </p>
      </div>

      <div className="flex-shrink-0 text-right">
        <span className="font-sans text-lg font-bold text-foreground">
          {formatCurrencyMXN(pricePesos)}
        </span>
      </div>
    </button>
  )
}
