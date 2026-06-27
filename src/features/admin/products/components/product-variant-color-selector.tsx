'use client'

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  canDeselectColorInPicker,
  deriveManualSelectedColorIdsFromDraft,
  filterColorPoolBySearch,
} from '../lib/variant-matrix-colors'
import {
  VARIANT_MATRIX_COLOR_PICKER_APPLY,
  VARIANT_MATRIX_COLOR_PICKER_CANCEL,
  VARIANT_MATRIX_COLOR_PICKER_DESCRIPTION,
  VARIANT_MATRIX_COLOR_PICKER_EMPTY,
  VARIANT_MATRIX_COLOR_PICKER_LOCKED,
  VARIANT_MATRIX_COLOR_PICKER_MORE,
  VARIANT_MATRIX_COLOR_PICKER_SEARCH,
  VARIANT_MATRIX_COLOR_PICKER_SELECTED,
  VARIANT_MATRIX_COLOR_PICKER_TITLE,
  VARIANT_MATRIX_COLOR_SELECTION_HELPER,
  VARIANT_MATRIX_SELECT_COLORS,
} from '../lib/variant-matrix-messages'
import type { ColorSelectOption } from '../types/admin-products-ui.types'

const MAX_VISIBLE_CHIPS = 5

type ProductVariantColorSelectorProps = {
  pool: ColorSelectOption[]
  visibleColorIds: string[]
  defaultColorIds: string[]
  variantColorIds: string[]
  disabled?: boolean
  onApplySelectedColors: (selectedColorIds: string[]) => void
  onRemoveVisibleColor: (colorId: string) => void
  canRemoveVisibleColor: (colorId: string) => boolean
}

function ColorSwatch({
  hex,
  name,
  size = 'sm',
}: {
  hex: string
  name: string
  size?: 'sm' | 'lg'
}) {
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full border border-border',
        size === 'lg' ? 'h-16 w-16' : 'h-4 w-4',
      )}
      style={{ backgroundColor: hex }}
      aria-hidden
      title={name}
    />
  )
}

function VisibleColorChip({
  color,
  disabled,
  removable,
  onRemove,
}: {
  color: ColorSelectOption
  disabled: boolean
  removable: boolean
  onRemove: () => void
}) {
  return (
    <Badge variant="outline" className="gap-1.5 py-1 pl-1.5 pr-1 font-sans text-xs">
      <ColorSwatch hex={color.hexCode ?? '#CCCCCC'} name={color.label} />
      <span className="max-w-[8rem] truncate">{color.label}</span>
      {removable ? (
        <button
          type="button"
          className="rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          disabled={disabled}
          aria-label={`Quitar ${color.label}`}
          onClick={onRemove}
          data-testid={`admin-product-variant-chip-remove-${color.value}`}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </Badge>
  )
}

function ColorPickerCard({
  color,
  selected,
  locked,
  disabled,
  onToggle,
}: {
  color: ColorSelectOption
  selected: boolean
  locked: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const hex = color.hexCode ?? '#CCCCCC'

  return (
    <button
      type="button"
      disabled={disabled || (selected && locked)}
      aria-pressed={selected}
      aria-label={color.label}
      title={selected && locked ? VARIANT_MATRIX_COLOR_PICKER_LOCKED : color.label}
      data-testid={`admin-product-variant-color-card-${color.value}`}
      data-selected={selected ? 'true' : 'false'}
      data-locked={locked ? 'true' : 'false'}
      onClick={onToggle}
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/40'
          : 'border-border bg-card hover:border-primary/30 hover:bg-accent/20',
        selected && locked && 'cursor-not-allowed opacity-90',
      )}
    >
      <span className="relative">
        <ColorSwatch hex={hex} name={color.label} size="lg" />
        {selected ? (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </span>
        ) : null}
      </span>
      <span className="line-clamp-2 min-h-[2.5rem] font-sans text-xs font-medium leading-tight">
        {color.label}
      </span>
      {color.slug ? (
        <span className="font-mono text-[10px] uppercase text-muted-foreground">{color.slug}</span>
      ) : null}
      {selected ? (
        <Badge variant="secondary" className="font-sans text-[10px]">
          {locked ? 'Con variantes' : VARIANT_MATRIX_COLOR_PICKER_SELECTED}
        </Badge>
      ) : null}
    </button>
  )
}

export function ProductVariantColorSelector({
  pool,
  visibleColorIds,
  defaultColorIds,
  variantColorIds,
  disabled = false,
  onApplySelectedColors,
  onRemoveVisibleColor,
  canRemoveVisibleColor,
}: ProductVariantColorSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [draftVisibleIds, setDraftVisibleIds] = useState<string[]>([])

  const variantColorIdSet = useMemo(() => new Set(variantColorIds), [variantColorIds])
  const poolById = useMemo(() => new Map(pool.map((color) => [color.value, color])), [pool])

  const visibleColors = useMemo(
    () =>
      visibleColorIds
        .map((colorId) => poolById.get(colorId))
        .filter((color): color is ColorSelectOption => Boolean(color)),
    [visibleColorIds, poolById],
  )

  const filteredPool = useMemo(
    () => filterColorPoolBySearch(pool, searchQuery),
    [pool, searchQuery],
  )

  const toggleDraftColor = (colorId: string) => {
    setDraftVisibleIds((current) => {
      const selected = new Set(current)
      const isSelected = selected.has(colorId)

      if (isSelected) {
        if (!canDeselectColorInPicker({ colorId, variantColorIds: variantColorIdSet })) {
          return current
        }
        selected.delete(colorId)
      } else {
        selected.add(colorId)
      }

      return [...selected]
    })
  }

  const handleCancel = () => {
    setOpen(false)
    setSearchQuery('')
    setDraftVisibleIds(visibleColorIds)
  }

  const handleApply = () => {
    const nextSelected = deriveManualSelectedColorIdsFromDraft({
      draftVisibleIds,
      defaultColorIds,
      variantColorIds,
    })
    onApplySelectedColors(nextSelected)
    setOpen(false)
    setSearchQuery('')
  }

  const draftSelectedSet = useMemo(() => new Set(draftVisibleIds), [draftVisibleIds])
  const chipColors = visibleColors.slice(0, MAX_VISIBLE_CHIPS)
  const hiddenChipCount = Math.max(visibleColors.length - MAX_VISIBLE_CHIPS, 0)

  return (
    <div className="space-y-2" data-testid="admin-product-variant-color-selector">
      <p className="font-serif text-xs text-muted-foreground">
        {VARIANT_MATRIX_COLOR_SELECTION_HELPER}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              setSearchQuery('')
              setDraftVisibleIds(visibleColorIds)
              setOpen(true)
              return
            }
            handleCancel()
          }}
        >
          <DialogTrigger asChild disabled={disabled}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="admin-product-variant-select-colors"
            >
              {VARIANT_MATRIX_SELECT_COLORS}
            </Button>
          </DialogTrigger>

          <DialogContent
            className="top-[4dvh] z-[60] flex max-h-[min(88dvh,calc(100dvh-2rem))] w-[min(calc(100vw-2rem),720px)] max-w-[calc(100vw-2rem)] translate-x-[-50%] translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-[720px]"
            data-testid="admin-product-variant-color-picker-dialog"
          >
            <DialogHeader className="shrink-0 space-y-2 border-b border-border px-6 py-4 text-left">
              <DialogTitle className="font-sans text-lg">
                {VARIANT_MATRIX_COLOR_PICKER_TITLE}
              </DialogTitle>
              <DialogDescription className="font-serif text-sm">
                {VARIANT_MATRIX_COLOR_PICKER_DESCRIPTION}
              </DialogDescription>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={VARIANT_MATRIX_COLOR_PICKER_SEARCH}
                className="mt-2"
                data-testid="admin-product-variant-color-search"
              />
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
              {filteredPool.length === 0 ? (
                <p
                  className="py-8 text-center font-serif text-sm text-muted-foreground"
                  data-testid="admin-product-variant-color-picker-empty"
                >
                  {VARIANT_MATRIX_COLOR_PICKER_EMPTY}
                </p>
              ) : (
                <div
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  data-testid="admin-product-variant-color-grid"
                >
                  {filteredPool.map((color) => {
                    const selected = draftSelectedSet.has(color.value)
                    const locked = selected && variantColorIdSet.has(color.value)

                    return (
                      <ColorPickerCard
                        key={color.value}
                        color={color}
                        selected={selected}
                        locked={locked}
                        disabled={disabled}
                        onToggle={() => toggleDraftColor(color.value)}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={handleCancel}
                data-testid="admin-product-variant-color-cancel"
              >
                {VARIANT_MATRIX_COLOR_PICKER_CANCEL}
              </Button>
              <Button
                type="button"
                disabled={disabled}
                onClick={handleApply}
                data-testid="admin-product-variant-color-apply"
              >
                {VARIANT_MATRIX_COLOR_PICKER_APPLY}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {chipColors.map((color) => (
          <VisibleColorChip
            key={color.value}
            color={color}
            disabled={disabled}
            removable={canRemoveVisibleColor(color.value)}
            onRemove={() => onRemoveVisibleColor(color.value)}
          />
        ))}

        {hiddenChipCount > 0 ? (
          <Badge variant="secondary" className="font-sans text-xs">
            {VARIANT_MATRIX_COLOR_PICKER_MORE(hiddenChipCount)}
          </Badge>
        ) : null}
      </div>
    </div>
  )
}
