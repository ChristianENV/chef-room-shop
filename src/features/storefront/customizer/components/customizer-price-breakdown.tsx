'use client'

import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatPriceMxn } from '../lib/customizer-utils'
import type { CustomizerPriceBreakdown } from '../pricing/customizer-pricing.types'

interface CustomizerPriceBreakdownProps {
  breakdown: CustomizerPriceBreakdown
  compact?: boolean
}

export function CustomizerPriceBreakdownPopover({
  breakdown,
  compact = false,
}: CustomizerPriceBreakdownProps) {
  const hasItems = breakdown.items.length > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          className="h-auto px-2 py-1 text-xs text-primary hover:bg-primary/10"
        >
          <Info className="mr-1 size-3.5" />
          Ver desglose
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Desglose de personalización
        </p>
        {hasItems ? (
          <ul className="space-y-1.5">
            {breakdown.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-2 text-xs">
                <span className="text-foreground">{item.label}</span>
                <span className="shrink-0 font-medium text-primary">
                  +{formatPriceMxn(item.amountCents).replace(' MXN', '')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Sin personalización bordada.</p>
        )}
        <p className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
          Solo bordado. El logo en espalda tiene precio especial si usas el mismo logo del pecho.
        </p>
      </PopoverContent>
    </Popover>
  )
}
