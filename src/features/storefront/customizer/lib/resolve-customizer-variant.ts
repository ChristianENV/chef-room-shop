import type {
  CustomizerProductColor,
  CustomizerProductData,
  CustomizerProductSize,
  CustomizerProductVariant,
} from '../types/customizer-product.types'
import type { Size } from '../types/customizer.types'

/** Normalizes hex for reliable comparison (#fff === #FFFFFF). */
export function normalizeHex(hex: string): string {
  const trimmed = hex.trim().toLowerCase()
  if (trimmed.length === 0) return trimmed
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (withHash.length === 4) {
    const r = withHash[1]
    const g = withHash[2]
    const b = withHash[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return withHash
}

export function findColorByHex(
  colors: CustomizerProductColor[],
  hex: string,
): CustomizerProductColor | null {
  const target = normalizeHex(hex)
  return colors.find((color) => normalizeHex(color.hex) === target) ?? null
}

export function findSizeByLabel(
  sizes: CustomizerProductSize[],
  sizeLabel: Size | string,
): CustomizerProductSize | null {
  const target = String(sizeLabel).trim().toUpperCase()
  return sizes.find((size) => size.name.trim().toUpperCase() === target) ?? null
}

function pickBestVariant(candidates: CustomizerProductVariant[]): CustomizerProductVariant | null {
  if (candidates.length === 0) return null
  return (
    candidates.find((variant) => variant.isActive && variant.stockQty > 0) ??
    candidates.find((variant) => variant.isActive) ??
    candidates[0] ??
    null
  )
}

/**
 * Resolves the catalog variant for the current color + size selection.
 * Falls back to partial matches so UI swatches stay in sync with cart mutations.
 */
export function resolveCustomizerVariant(
  product: CustomizerProductData | null | undefined,
  selection: { baseColor: string; size: Size | string },
): CustomizerProductVariant | null {
  if (!product || product.variants.length === 0) return null

  const color = findColorByHex(product.colors, selection.baseColor)
  const size = findSizeByLabel(product.sizes, selection.size)
  const colorId = color?.id ?? null
  const sizeId = size?.id ?? null

  if (colorId && sizeId) {
    const exact = pickBestVariant(
      product.variants.filter(
        (variant) => variant.colorId === colorId && variant.sizeId === sizeId,
      ),
    )
    if (exact) return exact
  }

  if (colorId) {
    const byColor = pickBestVariant(
      product.variants.filter((variant) => variant.colorId === colorId),
    )
    if (byColor) return byColor
  }

  if (sizeId) {
    const bySize = pickBestVariant(product.variants.filter((variant) => variant.sizeId === sizeId))
    if (bySize) return bySize
  }

  return pickBestVariant(product.variants)
}

export function computeDefaultCustomizerVariant(
  product: CustomizerProductData,
): CustomizerProductVariant | null {
  return pickBestVariant(product.variants)
}

export type CustomizerCartVariantFailureReason =
  | 'missing_color'
  | 'missing_size'
  | 'no_matching_variant'
  | 'out_of_stock'

export const CUSTOMIZER_CART_VARIANT_MESSAGES: Record<CustomizerCartVariantFailureReason, string> =
  {
    missing_color: 'Selecciona un color del catálogo para continuar.',
    missing_size: 'Selecciona una talla para continuar.',
    no_matching_variant: 'Esta combinación de talla y color no está disponible.',
    out_of_stock: 'La variante seleccionada no tiene stock disponible.',
  }

export type CustomizerCartVariantValidation =
  | {
      status: 'ok'
      variant: CustomizerProductVariant | null
      requiresVariant: boolean
    }
  | { status: 'error'; reason: CustomizerCartVariantFailureReason }

/**
 * Validates color + size against catalog rows before add-to-cart.
 * Products without variant rows can still be added (variant id optional).
 */
export function validateCustomizerCartVariant(
  product: CustomizerProductData | null | undefined,
  selection: { baseColor: string; size: Size | string },
): CustomizerCartVariantValidation {
  if (!product) {
    return { status: 'error', reason: 'missing_color' }
  }

  if (product.variants.length === 0) {
    return { status: 'ok', variant: null, requiresVariant: false }
  }

  const color = findColorByHex(product.colors, selection.baseColor)
  if (!color) {
    return { status: 'error', reason: 'missing_color' }
  }

  const size = findSizeByLabel(product.sizes, selection.size)
  if (!size) {
    return { status: 'error', reason: 'missing_size' }
  }

  const variant = pickBestVariant(
    product.variants.filter((row) => row.colorId === color.id && row.sizeId === size.id),
  )

  if (!variant) {
    return { status: 'error', reason: 'no_matching_variant' }
  }

  if (!variant.isActive || variant.stockQty <= 0) {
    return { status: 'error', reason: 'out_of_stock' }
  }

  return { status: 'ok', variant, requiresVariant: true }
}
