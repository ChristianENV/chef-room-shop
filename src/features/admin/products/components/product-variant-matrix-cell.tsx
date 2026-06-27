'use client'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { ProductVariantCellEditor } from './product-variant-cell-editor'
import {
  VARIANT_MATRIX_EDIT_CELL,
  VARIANT_MATRIX_STATE_INACTIVE,
  VARIANT_MATRIX_STATE_INVALID,
  VARIANT_MATRIX_STATE_MISSING,
} from '../lib/variant-matrix-messages'
import type { VariantCellState } from '../lib/variant-matrix'
import type { AdminProductVariantUi } from '../types/admin-products-ui.types'

type ProductVariantMatrixCellProps = {
  state: VariantCellState
  variant?: AdminProductVariantUi
  disabled?: boolean
  onToggle: (enabled: boolean) => void
  onChange: (patch: Partial<AdminProductVariantUi>) => void
}

export function ProductVariantMatrixCell({
  state,
  variant,
  disabled = false,
  onToggle,
  onChange,
}: ProductVariantMatrixCellProps) {
  const enabled = state === 'active' || state === 'inactive' || state === 'invalid'

  const cellContent = (
    <div
      className={cn(
        'flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-md border p-2 text-center transition-colors',
        state === 'missing' && 'border-dashed border-border bg-muted/20',
        state === 'active' && 'border-primary/30 bg-primary/5',
        state === 'inactive' && 'border-border bg-muted/40 opacity-80',
        state === 'invalid' && 'border-destructive/40 bg-destructive/5',
        !disabled && state !== 'missing' && 'hover:bg-accent/40',
      )}
    >
      <Checkbox
        checked={enabled}
        disabled={disabled || state === 'invalid'}
        onCheckedChange={(checked) => onToggle(checked === true)}
        onClick={(event) => event.stopPropagation()}
        aria-label={enabled ? VARIANT_MATRIX_EDIT_CELL : VARIANT_MATRIX_STATE_MISSING}
      />
      {variant && enabled ? (
        <>
          <span className="font-mono text-[10px] text-muted-foreground">{variant.stockQty} u.</span>
          <span className="font-sans text-[11px] font-medium">${variant.pricePesos}</span>
        </>
      ) : (
        <span className="font-serif text-[10px] text-muted-foreground">
          {state === 'invalid'
            ? VARIANT_MATRIX_STATE_INVALID
            : state === 'inactive'
              ? VARIANT_MATRIX_STATE_INACTIVE
              : VARIANT_MATRIX_STATE_MISSING}
        </span>
      )}
    </div>
  )

  if (!variant || state === 'missing') {
    return cellContent
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button type="button" className="w-full text-left" aria-label={VARIANT_MATRIX_EDIT_CELL}>
          {cellContent}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="center">
        <ProductVariantCellEditor variant={variant} disabled={disabled} onChange={onChange} />
      </PopoverContent>
    </Popover>
  )
}
