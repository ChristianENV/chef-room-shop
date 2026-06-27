import {
  createVariantForCell,
  ensureUniqueSkusInForm,
  variantMatrixKey,
  type VariantMatrixColorRow,
  type VariantMatrixSizeColumn,
} from './variant-matrix'
import type { AdminProductVariantUi } from '../types/admin-products-ui.types'

export type BulkApplyScope = 'all-visible' | 'active-only' | 'color' | 'size' | 'cells'

export type BulkTargetCell = { colorId: string; sizeId: string }

type ColorMeta = Record<string, { name: string; hexCode: string; slug: string }>
type SizeMeta = Record<string, { name: string; slug: string }>

/**
 * Parses a non-negative integer stock value. Returns null when invalid.
 */
export function parseBulkStockValue(raw: string | number): number | null {
  const value = typeof raw === 'number' ? raw : Number(raw.trim())
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) return null
  return value
}

/**
 * Parses a non-negative price value (pesos). Returns null when invalid.
 */
export function parseBulkPriceValue(raw: string | number): number | null {
  const value = typeof raw === 'number' ? raw : Number(raw.trim())
  if (!Number.isFinite(value) || value < 0) return null
  return value
}

/**
 * Resolves the color/size cells targeted by a bulk action for the visible matrix.
 * Invalid color rows are excluded from grid-wide scopes.
 */
export function resolveBulkTargetCells(params: {
  scope: BulkApplyScope
  colors: readonly VariantMatrixColorRow[]
  sizes: readonly VariantMatrixSizeColumn[]
  targetColorId?: string | null
  targetSizeId?: string | null
  selectedKeys?: ReadonlySet<string>
}): BulkTargetCell[] {
  const validColors = params.colors.filter((color) => !color.isInvalidForProductType)

  switch (params.scope) {
    case 'all-visible':
    case 'active-only':
      return validColors.flatMap((color) =>
        params.sizes.map((size) => ({ colorId: color.value, sizeId: size.value })),
      )
    case 'color': {
      if (!params.targetColorId) return []
      return params.sizes.map((size) => ({
        colorId: params.targetColorId as string,
        sizeId: size.value,
      }))
    }
    case 'size': {
      if (!params.targetSizeId) return []
      return validColors.map((color) => ({
        colorId: color.value,
        sizeId: params.targetSizeId as string,
      }))
    }
    case 'cells': {
      const keys = params.selectedKeys ?? new Set<string>()
      return [...keys]
        .map((key) => {
          const [colorId, sizeId] = key.split(':')
          return { colorId: colorId ?? '', sizeId: sizeId ?? '' }
        })
        .filter((cell) => Boolean(cell.colorId) && Boolean(cell.sizeId))
    }
  }
}

type ApplyBulkFieldParams = {
  variants: AdminProductVariantUi[]
  targetCells: readonly BulkTargetCell[]
  scope: BulkApplyScope
  field: 'stock' | 'price'
  value: number
  createMissing: boolean
  colorMeta: ColorMeta
  sizeMeta: SizeMeta
  productSlug: string
  basePricePesos: number
  newId: () => string
}

function applyBulkField(params: ApplyBulkFieldParams): AdminProductVariantUi[] {
  const targetKeys = new Set(
    params.targetCells.map((cell) => variantMatrixKey(cell.colorId, cell.sizeId)),
  )

  const next = params.variants.map((variant) => {
    const key = variantMatrixKey(variant.colorId, variant.sizeId)
    if (!targetKeys.has(key)) return variant
    // Active-only scope never touches inactive variants.
    if (params.scope === 'active-only' && !variant.isActive) return variant
    if (params.field === 'stock') return { ...variant, stockQty: params.value }
    return { ...variant, pricePesos: params.value }
  })

  // Active-only never creates new variants; only existing active cells are updated.
  if (!params.createMissing || params.scope === 'active-only') {
    return next
  }

  const existingKeys = new Set(next.map((v) => variantMatrixKey(v.colorId, v.sizeId)))
  const created: AdminProductVariantUi[] = []

  for (const cell of params.targetCells) {
    const key = variantMatrixKey(cell.colorId, cell.sizeId)
    if (existingKeys.has(key)) continue

    const color = params.colorMeta[cell.colorId]
    const size = params.sizeMeta[cell.sizeId]
    if (!color || !size) continue

    const variant = createVariantForCell({
      colorId: cell.colorId,
      sizeId: cell.sizeId,
      colorName: color.name,
      sizeName: size.name,
      colorSlug: color.slug,
      sizeSlug: size.slug,
      productSlug: params.productSlug,
      basePricePesos: params.basePricePesos,
      newId: params.newId,
    })

    created.push(
      params.field === 'stock'
        ? { ...variant, stockQty: params.value }
        : { ...variant, pricePesos: params.value },
    )
    existingKeys.add(key)
  }

  if (created.length === 0) return next
  return ensureUniqueSkusInForm([...next, ...created])
}

export type ApplyBulkStockParams = {
  variants: AdminProductVariantUi[]
  targetCells: readonly BulkTargetCell[]
  scope: BulkApplyScope
  stockQty: number
  createMissing: boolean
  colorMeta: ColorMeta
  sizeMeta: SizeMeta
  productSlug: string
  basePricePesos: number
  newId: () => string
}

/**
 * Applies a stock quantity to targeted cells in local form state only.
 * Optionally creates missing visible variants (base price, deterministic SKU, given stock).
 */
export function applyBulkStock(params: ApplyBulkStockParams): AdminProductVariantUi[] {
  return applyBulkField({
    variants: params.variants,
    targetCells: params.targetCells,
    scope: params.scope,
    field: 'stock',
    value: Math.max(0, Math.trunc(params.stockQty)),
    createMissing: params.createMissing,
    colorMeta: params.colorMeta,
    sizeMeta: params.sizeMeta,
    productSlug: params.productSlug,
    basePricePesos: params.basePricePesos,
    newId: params.newId,
  })
}

export type ApplyBulkPriceParams = {
  variants: AdminProductVariantUi[]
  targetCells: readonly BulkTargetCell[]
  scope: BulkApplyScope
  pricePesos: number
  createMissing?: boolean
  colorMeta: ColorMeta
  sizeMeta: SizeMeta
  productSlug: string
  basePricePesos: number
  newId: () => string
}

/**
 * Applies a price (pesos) to targeted cells in local form state only.
 */
export function applyBulkPrice(params: ApplyBulkPriceParams): AdminProductVariantUi[] {
  return applyBulkField({
    variants: params.variants,
    targetCells: params.targetCells,
    scope: params.scope,
    field: 'price',
    value: Math.max(0, params.pricePesos),
    createMissing: Boolean(params.createMissing),
    colorMeta: params.colorMeta,
    sizeMeta: params.sizeMeta,
    productSlug: params.productSlug,
    basePricePesos: params.basePricePesos,
    newId: params.newId,
  })
}
