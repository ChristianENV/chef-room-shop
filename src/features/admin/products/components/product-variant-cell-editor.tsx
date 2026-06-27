'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import {
  VARIANT_MATRIX_LABEL_ACTIVE,
  VARIANT_MATRIX_LABEL_PRICE,
  VARIANT_MATRIX_LABEL_SKU,
  VARIANT_MATRIX_LABEL_STOCK,
} from '../lib/variant-matrix-messages'
import type { AdminProductVariantUi } from '../types/admin-products-ui.types'

type ProductVariantCellEditorProps = {
  variant: AdminProductVariantUi
  disabled?: boolean
  onChange: (patch: Partial<AdminProductVariantUi>) => void
}

export function ProductVariantCellEditor({
  variant,
  disabled = false,
  onChange,
}: ProductVariantCellEditorProps) {
  return (
    <div className="grid gap-3">
      <div className="space-y-1">
        <Label className="font-sans text-xs">{VARIANT_MATRIX_LABEL_SKU}</Label>
        <Input
          value={variant.sku}
          disabled={disabled}
          onChange={(event) => onChange({ sku: event.target.value.toUpperCase() })}
          className="font-mono text-xs uppercase"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="font-sans text-xs">{VARIANT_MATRIX_LABEL_PRICE}</Label>
          <Input
            type="number"
            min={0}
            value={variant.pricePesos}
            disabled={disabled}
            onChange={(event) => onChange({ pricePesos: Math.max(0, Number(event.target.value)) })}
            className="font-sans"
          />
        </div>
        <div className="space-y-1">
          <Label className="font-sans text-xs">{VARIANT_MATRIX_LABEL_STOCK}</Label>
          <Input
            type="number"
            min={0}
            value={variant.stockQty}
            disabled={disabled}
            onChange={(event) => onChange({ stockQty: Math.max(0, Number(event.target.value)) })}
            className="font-sans"
          />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
        <Label className="font-sans text-xs">{VARIANT_MATRIX_LABEL_ACTIVE}</Label>
        <Switch
          checked={variant.isActive}
          disabled={disabled}
          onCheckedChange={(checked) => onChange({ isActive: checked })}
        />
      </div>
    </div>
  )
}
