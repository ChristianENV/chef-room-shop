'use client'

import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

import { ProductVariantCellEditor } from './product-variant-cell-editor'
import {
  VARIANT_MATRIX_ACTION_CREATE,
  VARIANT_MATRIX_ACTION_DEACTIVATE,
  VARIANT_MATRIX_ACTION_EDIT,
  VARIANT_MATRIX_ACTION_REACTIVATE,
  VARIANT_MATRIX_LABEL_ACTIVE,
  VARIANT_MATRIX_STATE_INACTIVE,
  VARIANT_MATRIX_STATE_INVALID,
  VARIANT_MATRIX_STATE_MISSING,
  VARIANT_MATRIX_SWITCH_ACTIVE,
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

function statusLabel(state: VariantCellState): string {
  switch (state) {
    case 'active':
      return VARIANT_MATRIX_LABEL_ACTIVE
    case 'missing':
      return VARIANT_MATRIX_STATE_MISSING
    case 'inactive':
      return VARIANT_MATRIX_STATE_INACTIVE
    case 'invalid':
      return VARIANT_MATRIX_STATE_INVALID
  }
}

function statusBadgeVariant(
  state: VariantCellState,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (state) {
    case 'active':
      return 'default'
    case 'missing':
      return 'outline'
    case 'inactive':
      return 'secondary'
    case 'invalid':
      return 'destructive'
  }
}

function MatrixCellShell({
  state,
  disabled,
  children,
}: {
  state: VariantCellState
  disabled: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex min-h-[108px] min-w-[92px] flex-col items-stretch gap-1.5 rounded-md border p-2 text-center transition-colors',
        state === 'missing' && 'border-dashed border-border bg-muted/20',
        state === 'active' && 'border-primary/40 bg-primary/5 shadow-sm',
        state === 'inactive' && 'border-border bg-muted/40',
        state === 'invalid' && 'border-destructive/40 bg-destructive/5',
        !disabled && 'hover:border-primary/30 hover:bg-accent/30',
      )}
      data-testid="admin-product-variant-matrix-cell"
      data-state={state}
    >
      {children}
    </div>
  )
}

export function ProductVariantMatrixCell({
  state,
  variant,
  disabled = false,
  onToggle,
  onChange,
}: ProductVariantMatrixCellProps) {
  const badge = (
    <Badge
      variant={statusBadgeVariant(state)}
      className="mx-auto w-fit px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide"
      data-testid="admin-product-variant-cell-status"
    >
      {statusLabel(state)}
    </Badge>
  )

  const metrics =
    variant && state !== 'missing' ? (
      <div className="space-y-0.5">
        <p className="font-mono text-[10px] text-muted-foreground">{variant.stockQty} u.</p>
        <p className="font-sans text-[11px] font-medium">${variant.pricePesos}</p>
      </div>
    ) : null

  if (state === 'missing') {
    return (
      <MatrixCellShell state={state} disabled={disabled}>
        {badge}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-full font-sans text-[11px]"
          disabled={disabled}
          onClick={() => onToggle(true)}
          data-testid="admin-product-variant-cell-create"
        >
          {VARIANT_MATRIX_ACTION_CREATE}
        </Button>
      </MatrixCellShell>
    )
  }

  if (!variant) {
    return (
      <MatrixCellShell state={state} disabled={disabled}>
        {badge}
      </MatrixCellShell>
    )
  }

  const isActive = variant.isActive
  const switchDisabled = disabled || state === 'invalid'

  return (
    <MatrixCellShell state={state} disabled={disabled}>
      {badge}
      {metrics}

      <div
        className="flex items-center justify-center gap-1.5"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Switch
          id={`variant-active-${variant.id}`}
          checked={isActive}
          disabled={switchDisabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
          data-testid="admin-product-variant-cell-active-switch"
          aria-label={VARIANT_MATRIX_SWITCH_ACTIVE}
        />
        <Label
          htmlFor={`variant-active-${variant.id}`}
          className="font-sans text-[10px] font-medium text-muted-foreground"
        >
          {VARIANT_MATRIX_SWITCH_ACTIVE}
        </Label>
      </div>

      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-full font-sans text-[11px]"
            data-testid="admin-product-variant-cell-edit"
          >
            {VARIANT_MATRIX_ACTION_EDIT}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="center">
          <ProductVariantCellEditor variant={variant} disabled={disabled} onChange={onChange} />
        </PopoverContent>
      </Popover>

      {state === 'invalid' ? null : isActive ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-full font-sans text-[11px] text-muted-foreground"
          disabled={disabled}
          onClick={() => onToggle(false)}
          data-testid="admin-product-variant-cell-deactivate"
        >
          {VARIANT_MATRIX_ACTION_DEACTIVATE}
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-full font-sans text-[11px]"
          disabled={disabled}
          onClick={() => onToggle(true)}
          data-testid="admin-product-variant-cell-reactivate"
        >
          {VARIANT_MATRIX_ACTION_REACTIVATE}
        </Button>
      )}
    </MatrixCellShell>
  )
}
