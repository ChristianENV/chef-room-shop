'use client'

import { Check, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'

import {
  capitalizeCarrierName,
  formatShippingEstimatedDays,
  type ShippingRateBadge,
} from '../lib/shipping-rate-ranking'
import type { ShippingRate } from '../types'

const BADGE_LABELS: Record<ShippingRateBadge, string> = {
  recommended: 'Recomendado',
  cheapest: 'Más económico',
  fastest: 'Más rápido',
  selected: 'Seleccionado',
}

const BADGE_ORDER: ShippingRateBadge[] = ['recommended', 'cheapest', 'fastest', 'selected']

type ShippingRateCardProps = {
  rate: ShippingRate
  selected: boolean
  badges?: ShippingRateBadge[]
  disabled?: boolean
  isSelecting?: boolean
  onSelect: () => void
}

function sortBadges(badges: ShippingRateBadge[]): ShippingRateBadge[] {
  return BADGE_ORDER.filter((b) => badges.includes(b))
}

export function ShippingRateCard({
  rate,
  selected,
  badges = [],
  disabled,
  isSelecting,
  onSelect,
}: ShippingRateCardProps) {
  const pricePesos = centsToPesos(rate.amountCents)
  const displayBadges = sortBadges(
    selected && !badges.includes('selected') ? [...badges, 'selected'] : badges,
  )
  const isDisabled = disabled || isSelecting

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={selected}
      aria-busy={isSelecting}
      data-testid="shipping-rate-card"
      className={cn(
        'relative flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-colors sm:flex-row sm:items-start',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
          : 'border-border bg-card hover:border-primary/40',
        isDisabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
            selected ? 'border-primary bg-primary text-white' : 'border-muted-foreground',
          )}
          aria-hidden
        >
          {selected && !isSelecting && <Check className="h-3 w-3" strokeWidth={3} />}
          {isSelecting && <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-base font-semibold text-foreground">
              {capitalizeCarrierName(rate.carrier)}
            </span>
            {displayBadges.map((badge) => (
              <Badge
                key={badge}
                variant={badge === 'recommended' ? 'default' : 'secondary'}
                className={cn(
                  'font-sans text-xs',
                  badge === 'recommended' && 'bg-primary hover:bg-primary/90',
                  badge === 'selected' && 'border-primary bg-transparent text-primary',
                )}
              >
                {BADGE_LABELS[badge]}
              </Badge>
            ))}
          </div>

          {rate.service && (
            <p className="mt-1 font-serif text-sm text-muted-foreground">{rate.service}</p>
          )}

          <p className="mt-2 font-serif text-sm text-muted-foreground">
            {formatShippingEstimatedDays(rate.estimatedDays)}
          </p>

          <p className="mt-1 font-serif text-xs text-muted-foreground">
            Tarifa calculada con tu carrito actual.
          </p>

          <p
            className={cn(
              'mt-2 font-sans text-xs font-medium',
              selected ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {isSelecting ? 'Guardando selección…' : selected ? 'Seleccionado' : 'Seleccionar'}
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 sm:text-right">
        <span className="font-sans text-xl font-bold text-foreground">
          {formatCurrencyMXN(pricePesos)}
        </span>
      </div>
    </button>
  )
}
