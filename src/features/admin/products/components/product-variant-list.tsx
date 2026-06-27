'use client'

import { Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { ProductVariantCellEditor } from './product-variant-cell-editor'
import {
  VARIANT_MATRIX_LABEL_ACTIVE,
  VARIANT_MATRIX_STATE_INACTIVE,
  VARIANT_MATRIX_STATE_INVALID,
} from '../lib/variant-matrix-messages'
import type { AdminProductVariantUi } from '../types/admin-products-ui.types'

type ProductVariantListProps = {
  variants: AdminProductVariantUi[]
  colorMeta: Record<string, { name: string; hexCode: string; slug: string }>
  invalidColorIds: Set<string>
  disabled?: boolean
  onChange: (variantId: string, patch: Partial<AdminProductVariantUi>) => void
  onRemove: (variantId: string) => void
}

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block h-8 w-8 shrink-0 rounded-md border border-border"
      style={{ backgroundColor: hex }}
      aria-hidden
    />
  )
}

export function ProductVariantList({
  variants,
  colorMeta,
  invalidColorIds,
  disabled = false,
  onChange,
  onRemove,
}: ProductVariantListProps) {
  if (variants.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 lg:hidden" data-testid="admin-product-variant-list">
      {variants.map((variant) => {
        const color = colorMeta[variant.colorId]
        const invalid = invalidColorIds.has(variant.colorId)

        return (
          <Card key={variant.id} className={cn(invalid && 'border-destructive/40')}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <ColorSwatch hex={color?.hexCode ?? '#CCCCCC'} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-sans text-sm font-medium">
                      {color?.name ?? variant.colorName} · {variant.sizeName}
                    </p>
                    {!variant.isActive ? (
                      <Badge variant="outline" className="font-sans text-[10px]">
                        {VARIANT_MATRIX_STATE_INACTIVE}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-sans text-[10px]">
                        {VARIANT_MATRIX_LABEL_ACTIVE}
                      </Badge>
                    )}
                    {invalid ? (
                      <Badge variant="destructive" className="font-sans text-[10px]">
                        {VARIANT_MATRIX_STATE_INVALID}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {variant.sku || 'Sin SKU'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-destructive"
                  disabled={disabled}
                  onClick={() => onRemove(variant.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <ProductVariantCellEditor
                variant={variant}
                disabled={disabled}
                onChange={(patch) => onChange(variant.id, patch)}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
