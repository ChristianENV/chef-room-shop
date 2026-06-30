'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { VariantMatrixColorRow, VariantMatrixSizeColumn } from '../lib/variant-matrix'
import {
  parseBulkPriceValue,
  parseBulkStockValue,
  type BulkApplyScope,
} from '../lib/variant-matrix-bulk'
import {
  VARIANT_BULK_APPLY_BASE_PRICE,
  VARIANT_BULK_APPLY_CUSTOM_PRICE,
  VARIANT_BULK_APPLY_STOCK,
  VARIANT_BULK_APPLY_TO_LABEL,
  VARIANT_BULK_CELLS_SELECTED,
  VARIANT_BULK_CLEAR_SELECTION,
  VARIANT_BULK_COLOR_LABEL,
  VARIANT_BULK_CREATE_MISSING,
  VARIANT_BULK_INVALID_PRICE,
  VARIANT_BULK_INVALID_STOCK,
  VARIANT_BULK_NO_CELLS_SELECTED,
  VARIANT_BULK_PRICE_TITLE,
  VARIANT_BULK_QUANTITY_LABEL,
  VARIANT_BULK_SCOPE_ACTIVE_ONLY,
  VARIANT_BULK_SCOPE_ALL_VISIBLE,
  VARIANT_BULK_SCOPE_CELLS,
  VARIANT_BULK_SCOPE_COLOR,
  VARIANT_BULK_SCOPE_SIZE,
  VARIANT_BULK_SELECT_COLOR,
  VARIANT_BULK_SELECT_SIZE,
  VARIANT_BULK_SIZE_LABEL,
  VARIANT_BULK_STOCK_TITLE,
} from '../lib/variant-matrix-messages'

export type BulkApplyRequest = {
  scope: BulkApplyScope
  targetColorId: string | null
  targetSizeId: string | null
  createMissing: boolean
}

type ProductVariantBulkToolsProps = {
  colors: VariantMatrixColorRow[]
  sizes: VariantMatrixSizeColumn[]
  selectedCellCount: number
  basePricePesos: number
  disabled?: boolean
  onApplyStock: (stockQty: number, request: BulkApplyRequest) => void
  onApplyPrice: (pricePesos: number, request: BulkApplyRequest) => void
  onClearSelection: () => void
}

const SCOPE_LABELS: Record<BulkApplyScope, string> = {
  'all-visible': VARIANT_BULK_SCOPE_ALL_VISIBLE,
  'active-only': VARIANT_BULK_SCOPE_ACTIVE_ONLY,
  color: VARIANT_BULK_SCOPE_COLOR,
  size: VARIANT_BULK_SCOPE_SIZE,
  cells: VARIANT_BULK_SCOPE_CELLS,
}

const SCOPE_ORDER: BulkApplyScope[] = ['all-visible', 'active-only', 'color', 'size', 'cells']

export function ProductVariantBulkTools({
  colors,
  sizes,
  selectedCellCount,
  basePricePesos,
  disabled = false,
  onApplyStock,
  onApplyPrice,
  onClearSelection,
}: ProductVariantBulkToolsProps) {
  const [scope, setScope] = useState<BulkApplyScope>('all-visible')
  const [stockValue, setStockValue] = useState('')
  const [priceValue, setPriceValue] = useState('')
  const [targetColorId, setTargetColorId] = useState<string>('')
  const [targetSizeId, setTargetSizeId] = useState<string>('')
  const [createMissing, setCreateMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validColors = colors.filter((color) => !color.isInvalidForProductType)

  const buildRequest = (): BulkApplyRequest | null => {
    if (scope === 'color' && !targetColorId) {
      setError(VARIANT_BULK_SELECT_COLOR)
      return null
    }
    if (scope === 'size' && !targetSizeId) {
      setError(VARIANT_BULK_SELECT_SIZE)
      return null
    }
    if (scope === 'cells' && selectedCellCount === 0) {
      setError(VARIANT_BULK_NO_CELLS_SELECTED)
      return null
    }
    return {
      scope,
      targetColorId: scope === 'color' ? targetColorId : null,
      targetSizeId: scope === 'size' ? targetSizeId : null,
      createMissing,
    }
  }

  const handleApplyStock = () => {
    setError(null)
    const parsed = parseBulkStockValue(stockValue)
    if (parsed === null) {
      setError(VARIANT_BULK_INVALID_STOCK)
      return
    }
    const request = buildRequest()
    if (!request) return
    onApplyStock(parsed, request)
  }

  const handleApplyPrice = (mode: 'base' | 'custom') => {
    setError(null)
    let pesos: number | null
    if (mode === 'base') {
      pesos = basePricePesos
    } else {
      pesos = parseBulkPriceValue(priceValue)
      if (pesos === null) {
        setError(VARIANT_BULK_INVALID_PRICE)
        return
      }
    }
    const request = buildRequest()
    if (!request) return
    onApplyPrice(pesos, { ...request, createMissing: false })
  }

  const scopeSelect = (
    <div className="space-y-1">
      <Label className="font-sans text-xs text-foreground">{VARIANT_BULK_APPLY_TO_LABEL}</Label>
      <Select
        value={scope}
        onValueChange={(value) => setScope(value as BulkApplyScope)}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 font-sans" data-testid="admin-product-bulk-scope">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SCOPE_ORDER.map((value) => (
            <SelectItem key={value} value={value}>
              {SCOPE_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const colorSelect =
    scope === 'color' ? (
      <div className="space-y-1">
        <Label className="font-sans text-xs text-foreground">{VARIANT_BULK_COLOR_LABEL}</Label>
        <Select value={targetColorId} onValueChange={setTargetColorId} disabled={disabled}>
          <SelectTrigger className="h-9 font-sans" data-testid="admin-product-bulk-color">
            <SelectValue placeholder={VARIANT_BULK_COLOR_LABEL} />
          </SelectTrigger>
          <SelectContent>
            {validColors.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : null

  const sizeSelect =
    scope === 'size' ? (
      <div className="space-y-1">
        <Label className="font-sans text-xs text-foreground">{VARIANT_BULK_SIZE_LABEL}</Label>
        <Select value={targetSizeId} onValueChange={setTargetSizeId} disabled={disabled}>
          <SelectTrigger className="h-9 font-sans" data-testid="admin-product-bulk-size">
            <SelectValue placeholder={VARIANT_BULK_SIZE_LABEL} />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ) : null

  return (
    <div
      className="space-y-4 rounded-lg border border-border bg-muted/20 p-4"
      data-testid="admin-product-variant-bulk-tools"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-sans text-sm font-medium text-foreground">{VARIANT_BULK_STOCK_TITLE}</p>
        {selectedCellCount > 0 ? (
          <div className="flex items-center gap-2">
            <span
              className="font-serif text-xs text-muted-foreground"
              data-testid="admin-product-bulk-selected-count"
            >
              {VARIANT_BULK_CELLS_SELECTED(selectedCellCount)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 font-sans text-xs"
              disabled={disabled}
              onClick={onClearSelection}
              data-testid="admin-product-bulk-clear-selection"
            >
              {VARIANT_BULK_CLEAR_SELECTION}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="bulk-stock-qty" className="font-sans text-xs text-foreground">
            {VARIANT_BULK_QUANTITY_LABEL}
          </Label>
          <Input
            id="bulk-stock-qty"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={stockValue}
            disabled={disabled}
            onChange={(event) => setStockValue(event.target.value)}
            className="h-9 font-sans"
            data-testid="admin-product-bulk-stock-input"
          />
        </div>
        {scopeSelect}
        {colorSelect}
        {sizeSelect}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-serif text-xs text-foreground/80">
          <Checkbox
            checked={createMissing}
            disabled={disabled}
            onCheckedChange={(checked) => setCreateMissing(checked === true)}
            data-testid="admin-product-bulk-create-missing"
          />
          {VARIANT_BULK_CREATE_MISSING}
        </label>
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          onClick={handleApplyStock}
          data-testid="admin-product-bulk-apply-stock"
        >
          {VARIANT_BULK_APPLY_STOCK}
        </Button>
      </div>

      <div className="space-y-2 border-t border-border pt-3">
        <p className="font-sans text-sm font-medium text-foreground">{VARIANT_BULK_PRICE_TITLE}</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="bulk-price-value" className="font-sans text-xs text-foreground">
              {VARIANT_BULK_PRICE_TITLE}
            </Label>
            <Input
              id="bulk-price-value"
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              value={priceValue}
              disabled={disabled}
              onChange={(event) => setPriceValue(event.target.value)}
              className="h-9 w-36 font-sans"
              data-testid="admin-product-bulk-price-input"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => handleApplyPrice('base')}
            data-testid="admin-product-bulk-apply-base-price"
          >
            {VARIANT_BULK_APPLY_BASE_PRICE}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => handleApplyPrice('custom')}
            data-testid="admin-product-bulk-apply-custom-price"
          >
            {VARIANT_BULK_APPLY_CUSTOM_PRICE}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="font-serif text-xs text-destructive" data-testid="admin-product-bulk-error">
          {error}
        </p>
      ) : null}
    </div>
  )
}
