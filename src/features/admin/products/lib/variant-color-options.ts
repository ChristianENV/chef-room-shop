import {
  getAllowedVariantColorSlugsForProductType,
  isVariantColorAllowedForProductType,
} from '@/src/config/catalog-colors'
import {
  PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE,
  VARIANT_COLOR_INVALID_LABEL,
  VARIANT_COLOR_SELECT_HELP,
} from '@/src/config/catalog-color-messages'

import type { AdminColor, AdminProductFormOptions } from '../types'
import type { ColorSelectOption, ProductFormValues } from '../types/admin-products-ui.types'

export {
  PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE,
  VARIANT_COLOR_INVALID_LABEL,
  VARIANT_COLOR_SELECT_HELP,
}

export function resolveProductTypeSlugById(
  productTypes: AdminProductFormOptions['productTypes'],
  productTypeId: string | null | undefined,
): string | null {
  if (!productTypeId) return null
  return productTypes.find((type) => type.id === productTypeId)?.slug ?? null
}

/**
 * Variant color dropdown options filtered by product type, with legacy invalid colors retained when editing.
 */
export function buildVariantColorSelectOptions(params: {
  colors: readonly AdminColor[]
  productTypeSlug: string | null
  existingVariantColorIds?: readonly string[]
}): ColorSelectOption[] {
  const { colors, productTypeSlug, existingVariantColorIds = [] } = params
  if (!productTypeSlug) return []

  const allowed = new Set(getAllowedVariantColorSlugsForProductType(productTypeSlug))
  const legacyIds = new Set(existingVariantColorIds.filter(Boolean))

  return colors
    .filter((color) => allowed.has(color.slug) || legacyIds.has(color.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .map((color) => {
      const isInvalidForProductType = !allowed.has(color.slug)
      return {
        value: color.id,
        label: isInvalidForProductType
          ? `${color.name} — ${VARIANT_COLOR_INVALID_LABEL}`
          : color.name,
        isInvalidForProductType,
      }
    })
}

export function validateFormVariantColors(
  formValues: Pick<ProductFormValues, 'productTypeId' | 'variants'>,
  formOptions: AdminProductFormOptions,
): string | null {
  const productTypeSlug = resolveProductTypeSlugById(
    formOptions.productTypes,
    formValues.productTypeId,
  )
  if (!productTypeSlug) return null

  for (const variant of formValues.variants) {
    if (!variant.colorId) continue
    const color = formOptions.colors.find((row) => row.id === variant.colorId)
    if (!color) continue
    if (
      !isVariantColorAllowedForProductType({
        productTypeSlug,
        colorSlug: color.slug,
      })
    ) {
      return PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE
    }
  }

  return null
}

export function isVariantColorIdInvalidForProductType(params: {
  colorId: string
  colors: readonly AdminColor[]
  productTypeSlug: string | null
}): boolean {
  if (!params.productTypeSlug) return false
  const color = params.colors.find((row) => row.id === params.colorId)
  if (!color) return false
  return !isVariantColorAllowedForProductType({
    productTypeSlug: params.productTypeSlug,
    colorSlug: color.slug,
  })
}
