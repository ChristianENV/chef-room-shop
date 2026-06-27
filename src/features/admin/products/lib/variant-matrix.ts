import type { AdminSize } from '../types'
import type {
  AdminProductVariantUi,
  ColorSelectOption,
  SelectOption,
} from '../types/admin-products-ui.types'

export type VariantCellState = 'missing' | 'active' | 'inactive' | 'invalid'

export type VariantMatrixColorRow = ColorSelectOption & {
  hexCode: string
}

export type VariantMatrixSizeColumn = SelectOption & {
  slug: string
}

export function variantMatrixKey(colorId: string, sizeId: string): string {
  return `${colorId}:${sizeId}`
}

export function isShoeSizeSlug(slug: string): boolean {
  const value = Number(slug)
  return Number.isInteger(value) && value >= 22 && value <= 30
}

export function isShoeProductType(productTypeSlug: string | null): boolean {
  return productTypeSlug === 'shoes'
}

/**
 * Apparel categories use letter sizes; shoes use numeric 22–30.
 */
export function filterVariantSizesForProductType<T extends Pick<AdminSize, 'slug'>>(
  sizes: readonly T[],
  productTypeSlug: string | null,
): T[] {
  if (!productTypeSlug) return []

  const shoes = isShoeProductType(productTypeSlug)
  return sizes.filter((size) => {
    const shoeSize = isShoeSizeSlug(size.slug)
    return shoes ? shoeSize : !shoeSize
  })
}

export function buildVariantMatrixColorRows(params: {
  colors: readonly ColorSelectOption[]
  colorMeta: Record<string, { name: string; hexCode: string; slug: string }>
  variants: readonly AdminProductVariantUi[]
}): VariantMatrixColorRow[] {
  const variantColorIds = new Set(params.variants.map((variant) => variant.colorId))

  return params.colors
    .filter((color) => !color.isInvalidForProductType || variantColorIds.has(color.value))
    .map((color) => ({
      ...color,
      hexCode: params.colorMeta[color.value]?.hexCode ?? '#CCCCCC',
    }))
}

export function buildVariantMatrixSizeColumns(
  sizes: readonly SelectOption[],
  sizeRecords: readonly Pick<AdminSize, 'id' | 'slug'>[],
): VariantMatrixSizeColumn[] {
  const slugById = new Map(sizeRecords.map((size) => [size.id, size.slug]))

  return sizes.map((size) => ({
    ...size,
    slug: slugById.get(size.value) ?? size.label.toLowerCase(),
  }))
}

export function findVariantAt(
  variants: readonly AdminProductVariantUi[],
  colorId: string,
  sizeId: string,
): AdminProductVariantUi | undefined {
  return variants.find((variant) => variant.colorId === colorId && variant.sizeId === sizeId)
}

export function findVariantIndex(
  variants: readonly AdminProductVariantUi[],
  colorId: string,
  sizeId: string,
): number {
  return variants.findIndex((variant) => variant.colorId === colorId && variant.sizeId === sizeId)
}

export function resolveVariantCellState(
  variant: AdminProductVariantUi | undefined,
  colorInvalid: boolean,
): VariantCellState {
  if (!variant) return 'missing'
  if (colorInvalid) return 'invalid'
  if (!variant.isActive) return 'inactive'
  return 'active'
}

/**
 * Builds a deterministic SKU aligned with server `buildVariantSkuBase`.
 */
export function buildDeterministicVariantSku(
  productSlug: string,
  colorSlug: string,
  sizeSlug: string,
): string {
  const parts = [productSlug, colorSlug, sizeSlug].map((part) =>
    part.toUpperCase().replace(/[^A-Z0-9]/g, ''),
  )
  return ['CR', ...parts.filter(Boolean)].join('-').slice(0, 80)
}

export function ensureUniqueSkusInForm(variants: AdminProductVariantUi[]): AdminProductVariantUi[] {
  const used = new Set<string>()

  return variants.map((variant) => {
    const normalized = variant.sku.trim().toUpperCase()
    if (!normalized) return variant

    let candidate = normalized
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${normalized}-${suffix}`
      suffix += 1
    }

    used.add(candidate)
    return candidate === variant.sku ? variant : { ...variant, sku: candidate }
  })
}

export function createVariantForCell(params: {
  colorId: string
  sizeId: string
  colorName: string
  sizeName: string
  colorSlug: string
  sizeSlug: string
  productSlug: string
  basePricePesos: number
  newId: () => string
}): AdminProductVariantUi {
  return {
    id: params.newId(),
    sku: buildDeterministicVariantSku(params.productSlug, params.colorSlug, params.sizeSlug),
    variantName: null,
    colorId: params.colorId,
    sizeId: params.sizeId,
    colorName: params.colorName,
    sizeName: params.sizeName,
    pricePesos: params.basePricePesos,
    stockQty: 0,
    isActive: true,
    isPersisted: false,
  }
}

export function generateMissingVariants(params: {
  variants: AdminProductVariantUi[]
  colors: readonly VariantMatrixColorRow[]
  sizes: readonly VariantMatrixSizeColumn[]
  colorMeta: Record<string, { name: string; hexCode: string; slug: string }>
  sizeMeta: Record<string, { name: string; slug: string }>
  productSlug: string
  basePricePesos: number
  newId: () => string
}): AdminProductVariantUi[] {
  const existingKeys = new Set(
    params.variants.map((variant) => variantMatrixKey(variant.colorId, variant.sizeId)),
  )
  const next = [...params.variants]

  for (const color of params.colors.filter((row) => !row.isInvalidForProductType)) {
    for (const size of params.sizes) {
      const key = variantMatrixKey(color.value, size.value)
      if (existingKeys.has(key)) continue

      const meta = params.colorMeta[color.value]
      const sizeRecord = params.sizeMeta[size.value]
      if (!meta || !sizeRecord) continue

      next.push(
        createVariantForCell({
          colorId: color.value,
          sizeId: size.value,
          colorName: meta.name,
          sizeName: sizeRecord.name,
          colorSlug: meta.slug,
          sizeSlug: sizeRecord.slug,
          productSlug: params.productSlug,
          basePricePesos: params.basePricePesos,
          newId: params.newId,
        }),
      )
      existingKeys.add(key)
    }
  }

  return ensureUniqueSkusInForm(next)
}

export function applyBasePriceToEmptyVariants(
  variants: AdminProductVariantUi[],
  basePricePesos: number,
): AdminProductVariantUi[] {
  return variants.map((variant) =>
    variant.pricePesos === 0 ? { ...variant, pricePesos: basePricePesos } : variant,
  )
}

export function applyInitialStockToNewVariants(
  variants: AdminProductVariantUi[],
  initialStock = 0,
): AdminProductVariantUi[] {
  return variants.map((variant) =>
    !variant.isPersisted ? { ...variant, stockQty: initialStock } : variant,
  )
}

export function upsertVariantPatch(
  variants: AdminProductVariantUi[],
  colorId: string,
  sizeId: string,
  patch: Partial<AdminProductVariantUi>,
): AdminProductVariantUi[] {
  const index = findVariantIndex(variants, colorId, sizeId)
  if (index < 0) return variants

  return variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant))
}

export function removeVariantAt(
  variants: AdminProductVariantUi[],
  colorId: string,
  sizeId: string,
): AdminProductVariantUi[] {
  return variants.filter((variant) => !(variant.colorId === colorId && variant.sizeId === sizeId))
}

export function sortVariantsForDisplay(
  variants: AdminProductVariantUi[],
  colorOrder: readonly string[],
  sizeOrder: readonly string[],
): AdminProductVariantUi[] {
  const colorRank = new Map(colorOrder.map((id, index) => [id, index]))
  const sizeRank = new Map(sizeOrder.map((id, index) => [id, index]))

  return [...variants].sort((a, b) => {
    const colorDiff = (colorRank.get(a.colorId) ?? 999) - (colorRank.get(b.colorId) ?? 999)
    if (colorDiff !== 0) return colorDiff
    return (sizeRank.get(a.sizeId) ?? 999) - (sizeRank.get(b.sizeId) ?? 999)
  })
}

export function resolveProductSlugForVariants(productSlug: string, productName: string): string {
  const trimmed = productSlug.trim()
  if (trimmed) return trimmed

  return productName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}
