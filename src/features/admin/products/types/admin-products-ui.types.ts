import type { AdminProduct, AdminProductFormOptions } from '../types'
import {
  buildVariantColorSelectOptions,
  resolveProductTypeSlugById,
} from '../lib/variant-color-options'

export type AdminProductStatusUi = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export type StatusBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export type AdminProductTableRow = {
  id: string
  name: string
  slug: string
  identifier: string
  productTypeSlug: string
  productTypeLabel: string
  basePricePesos: number
  basePriceFormatted: string
  variantCount: number
  customizable: boolean
  status: AdminProductStatusUi
  statusLabel: string
  statusBadgeVariant: StatusBadgeVariant
  imageUrl: string | null
  imageAlt: string
  updatedAt: string
  updatedAtFormatted: string
  product: AdminProduct
}

export type AdminProductVariantUi = {
  id: string
  sku: string
  variantName: string | null
  colorId: string
  sizeId: string
  colorName: string
  sizeName: string
  pricePesos: number
  stockQty: number
  isActive: boolean
  isPersisted: boolean
}

export type AdminProductImageUi = {
  id: string
  url: string
  publicId: string | null
  alt: string
  sortOrder: number
  isPrimary: boolean
  isPersisted: boolean
}

export type ProductFormValues = {
  name: string
  slug: string
  shortDescription: string
  description: string
  productTypeId: string
  basePricePesos: number
  customizable: boolean
  status: AdminProductStatusUi
  seoTitle: string
  seoDescription: string
  seoImageId: string | null
  variants: AdminProductVariantUi[]
  images: AdminProductImageUi[]
}

export type SelectOption = {
  value: string
  label: string
}

export type ColorSelectOption = SelectOption & {
  isInvalidForProductType?: boolean
}

export type MapFormOptionsParams = {
  selectedProductTypeId?: string | null
  existingVariantColorIds?: readonly string[]
}

export type AdminProductFormSelectOptions = {
  productTypes: SelectOption[]
  colors: ColorSelectOption[]
  sizes: SelectOption[]
  hasProductTypeSelected: boolean
  colorMeta: Record<string, { name: string; hexCode: string; slug: string }>
}

type ProductTypeLabelSource = {
  nameEs?: string | null
  name?: string | null
  slug?: string
}

/**
 * Resolves a ProductType display label from GraphQL fields (prefers nameEs).
 */
export function resolveProductTypeLabel(source: ProductTypeLabelSource): string {
  return source.nameEs?.trim() || source.name?.trim() || source.slug || ''
}

function compareSortOrder(a: number | null | undefined, b: number | null | undefined): number {
  return (a ?? 0) - (b ?? 0)
}

function normalizeMapFormOptionsParams(
  params?: string | null | MapFormOptionsParams,
): MapFormOptionsParams {
  if (params == null || typeof params === 'string') {
    return { selectedProductTypeId: params ?? null }
  }
  return params
}

export function mapFormOptionsToSelectOptions(
  options: AdminProductFormOptions,
  params?: string | null | MapFormOptionsParams,
): AdminProductFormSelectOptions {
  const { selectedProductTypeId, existingVariantColorIds } = normalizeMapFormOptionsParams(params)

  const productTypeSlug = resolveProductTypeSlugById(options.productTypes, selectedProductTypeId)

  const colorMeta: AdminProductFormSelectOptions['colorMeta'] = {}
  options.colors.forEach((color) => {
    colorMeta[color.id] = { name: color.name, hexCode: color.hexCode, slug: color.slug }
  })

  return {
    productTypes: [...options.productTypes]
      .filter((type) => type.isActive || type.id === selectedProductTypeId)
      .sort((a, b) => compareSortOrder(a.sortOrder, b.sortOrder))
      .map((type) => ({
        value: type.id,
        label: resolveProductTypeLabel({
          nameEs: type.nameEs,
          name: type.name,
          slug: type.slug,
        }),
      })),
    colors: buildVariantColorSelectOptions({
      colors: options.colors,
      productTypeSlug,
      existingVariantColorIds,
    }),
    sizes: [...options.sizes]
      .sort((a, b) => compareSortOrder(a.sortOrder, b.sortOrder))
      .map((size) => ({
        value: size.id,
        label: size.name,
      })),
    hasProductTypeSelected: Boolean(productTypeSlug),
    colorMeta,
  }
}

/** @deprecated Use resolveProductTypeLabel */
export function mapProductTypeSlugToLabel(
  slug: string,
  fallbackName?: string,
  nameEs?: string,
): string {
  return resolveProductTypeLabel({ nameEs, name: fallbackName, slug })
}
