'use client'

import { cn } from '@/lib/utils'
import { formatCurrencyMXN, centsToPesos } from '@/src/lib/formatters'

import type { CartCommercialOptionSnapshot } from '../types/cart-bff.types'

type CartCommercialOptionsSummaryProps = {
  options: CartCommercialOptionSnapshot[]
  className?: string
  compact?: boolean
}

/**
 * Displays selected commercial product options (not customizer personalization).
 */
export function CartCommercialOptionsSummary({
  options,
  className,
  compact = false,
}: CartCommercialOptionsSummaryProps) {
  if (options.length === 0) return null

  return (
    <ul
      className={cn('space-y-1', className)}
      data-testid="cart-commercial-options-summary"
    >
      {options.map((option) => (
        <li
          key={`${option.groupId}:${option.valueId}`}
          className={cn(
            'flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5',
            compact ? 'font-serif text-xs' : 'font-serif text-sm',
          )}
        >
          <span className="text-muted-foreground">
            <span className="font-sans font-medium text-foreground/90">{option.groupName}:</span>{' '}
            {option.valueLabel}
          </span>
          {option.priceDeltaCents > 0 ? (
            <span className="font-sans text-primary">
              +{formatCurrencyMXN(centsToPesos(option.priceDeltaCents))}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
