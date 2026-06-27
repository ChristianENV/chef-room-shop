'use client'

import {
  VARIANT_MATRIX_LABEL_COLOR,
  VARIANT_MATRIX_LABEL_SIZE,
  VARIANT_MATRIX_TITLE,
} from '../lib/variant-matrix-messages'
import type { VariantMatrixColorRow, VariantMatrixSizeColumn } from '../lib/variant-matrix'
import { findVariantAt, resolveVariantCellState } from '../lib/variant-matrix'
import type { AdminProductVariantUi } from '../types/admin-products-ui.types'
import { ProductVariantMatrixCell } from './product-variant-matrix-cell'

type ProductVariantMatrixProps = {
  colors: VariantMatrixColorRow[]
  sizes: VariantMatrixSizeColumn[]
  variants: AdminProductVariantUi[]
  disabled?: boolean
  onToggleCell: (colorId: string, sizeId: string, enabled: boolean) => void
  onChangeCell: (colorId: string, sizeId: string, patch: Partial<AdminProductVariantUi>) => void
}

function ColorSwatch({ hex, name }: { hex: string; name: string }) {
  return (
    <span
      className="inline-block h-5 w-5 shrink-0 rounded-full border border-border"
      style={{ backgroundColor: hex }}
      aria-hidden
      title={name}
    />
  )
}

export function ProductVariantMatrix({
  colors,
  sizes,
  variants,
  disabled = false,
  onToggleCell,
  onChangeCell,
}: ProductVariantMatrixProps) {
  return (
    <div className="hidden lg:block" data-testid="admin-product-variant-matrix">
      <p className="mb-3 font-sans text-sm font-medium text-foreground">{VARIANT_MATRIX_TITLE}</p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="sticky left-0 z-10 bg-muted/30 px-3 py-2 text-left font-sans font-medium">
                {VARIANT_MATRIX_LABEL_COLOR}
              </th>
              {sizes.map((size) => (
                <th
                  key={size.value}
                  className="min-w-[88px] px-2 py-2 text-center font-sans text-xs font-medium"
                >
                  {size.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr key={color.value} className="border-b border-border last:border-b-0">
                <td className="sticky left-0 z-10 bg-background px-3 py-2">
                  <div className="flex items-center gap-2">
                    <ColorSwatch hex={color.hexCode} name={color.label} />
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-medium">{color.label}</p>
                      {color.isInvalidForProductType ? (
                        <p className="font-serif text-[11px] text-destructive">Inválido</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                {sizes.map((size) => {
                  const variant = findVariantAt(variants, color.value, size.value)
                  const state = resolveVariantCellState(
                    variant,
                    Boolean(color.isInvalidForProductType),
                  )

                  return (
                    <td key={size.value} className="px-2 py-2 align-top">
                      <ProductVariantMatrixCell
                        state={state}
                        variant={variant}
                        disabled={disabled}
                        onToggle={(enabled) => onToggleCell(color.value, size.value, enabled)}
                        onChange={(patch) => onChangeCell(color.value, size.value, patch)}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 font-serif text-xs text-muted-foreground">
        {VARIANT_MATRIX_LABEL_SIZE}: columnas · {VARIANT_MATRIX_LABEL_COLOR}: filas
      </p>
    </div>
  )
}
