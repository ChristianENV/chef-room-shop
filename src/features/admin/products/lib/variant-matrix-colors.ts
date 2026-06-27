import { getAllowedVariantColorSlugsForProductType } from '@/src/config/catalog-colors'
import { isVariantColorEligibleForProductType } from '@/src/config/variant-color-eligibility'

import type { AdminColor } from '../types'
import type { ColorSelectOption } from '../types/admin-products-ui.types'
import type { VariantMatrixColorRow } from './variant-matrix'

function compareSortOrder(a: number | null | undefined, b: number | null | undefined): number {
  return (a ?? 0) - (b ?? 0)
}

/**
 * Canonical default matrix rows per product type (slug allowlist), not every fabric color.
 */
export function resolveDefaultMatrixColorIds(
  productTypeSlug: string,
  colors: readonly AdminColor[],
): string[] {
  const allowedSlugs = new Set(getAllowedVariantColorSlugsForProductType(productTypeSlug))

  return colors
    .filter(
      (color) =>
        allowedSlugs.has(color.slug) &&
        isVariantColorEligibleForProductType({ productTypeSlug, color }),
    )
    .sort(
      (a, b) => compareSortOrder(a.sortOrder, b.sortOrder) || a.name.localeCompare(b.name, 'es'),
    )
    .map((color) => color.id)
}

/**
 * Visible matrix rows = defaults + manually selected + any color used by existing variants.
 */
export function resolveVisibleMatrixColorIds(params: {
  productTypeSlug: string
  colors: readonly AdminColor[]
  variants: readonly { colorId: string }[]
  selectedColorIds: readonly string[]
}): string[] {
  const ids = new Set<string>([
    ...resolveDefaultMatrixColorIds(params.productTypeSlug, params.colors),
    ...params.selectedColorIds,
    ...params.variants.map((variant) => variant.colorId),
  ])

  const rank = new Map(
    [...params.colors]
      .sort(
        (a, b) => compareSortOrder(a.sortOrder, b.sortOrder) || a.name.localeCompare(b.name, 'es'),
      )
      .map((color, index) => [color.id, index]),
  )

  return [...ids].sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999))
}

export function buildVariantColorPoolOptions(params: {
  colors: readonly AdminColor[]
  productTypeSlug: string | null
}): ColorSelectOption[] {
  const { colors, productTypeSlug } = params
  if (!productTypeSlug) return []

  return colors
    .filter((color) => isVariantColorEligibleForProductType({ productTypeSlug, color }))
    .sort(
      (a, b) => compareSortOrder(a.sortOrder, b.sortOrder) || a.name.localeCompare(b.name, 'es'),
    )
    .map((color) => ({
      value: color.id,
      label: color.name,
      hexCode: color.hexCode,
      slug: color.slug,
      isInvalidForProductType: false,
    }))
}

export function buildVisibleMatrixColorRows(params: {
  visibleColorIds: readonly string[]
  colors: readonly AdminColor[]
  productTypeSlug: string
}): VariantMatrixColorRow[] {
  const byId = new Map(params.colors.map((color) => [color.id, color]))

  return params.visibleColorIds
    .map((colorId) => byId.get(colorId))
    .filter((color): color is AdminColor => Boolean(color))
    .map((color) => ({
      value: color.id,
      label: color.name,
      hexCode: color.hexCode,
      isInvalidForProductType: !isVariantColorEligibleForProductType({
        productTypeSlug: params.productTypeSlug,
        color,
      }),
    }))
}

export function canRemoveColorFromMatrix(params: {
  colorId: string
  variants: readonly { colorId: string }[]
}): boolean {
  return !params.variants.some((variant) => variant.colorId === params.colorId)
}

export function resolveVariantColorIds(variants: readonly { colorId: string }[]): string[] {
  return [...new Set(variants.map((variant) => variant.colorId))]
}

export function deriveManualSelectedColorIdsFromDraft(params: {
  draftVisibleIds: readonly string[]
  defaultColorIds: readonly string[]
  variantColorIds: readonly string[]
}): string[] {
  const defaults = new Set(params.defaultColorIds)
  const variants = new Set(params.variantColorIds)

  return [...new Set(params.draftVisibleIds)].filter(
    (colorId) => !defaults.has(colorId) && !variants.has(colorId),
  )
}

export function canDeselectColorInPicker(params: {
  colorId: string
  variantColorIds: ReadonlySet<string>
}): boolean {
  return !params.variantColorIds.has(params.colorId)
}

export function filterColorPoolBySearch(
  pool: readonly ColorSelectOption[],
  query: string,
): ColorSelectOption[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...pool]

  return pool.filter((color) => {
    const haystack = [color.label, color.slug, color.hexCode, color.value]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalized)
  })
}

export function partitionMatrixColorSelection(params: {
  visibleColorIds: readonly string[]
  pool: readonly ColorSelectOption[]
}): {
  selected: ColorSelectOption[]
  available: ColorSelectOption[]
} {
  const visible = new Set(params.visibleColorIds)
  const selected = params.pool.filter((color) => visible.has(color.value))
  const available = params.pool.filter((color) => !visible.has(color.value))
  return { selected, available }
}
