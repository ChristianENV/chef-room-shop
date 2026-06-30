import type { Product } from '@/lib/types'
import type {
  CatalogColor,
  CatalogProduct,
  CatalogProductImage,
  CatalogProductType,
  CatalogProductVariant,
  CatalogSize,
} from '@/src/features/storefront/catalog/types'

/** Variant row used by PDP add-to-cart (color slug + size label). */
export type ProductVariantOption = {
  id: string
  colorSlug: string
  sizeName: string
  stockQty: number
  isActive: boolean
  priceCents: number
}

/** Commercial product option value from catalog BFF. */
export type ProductOptionValue = {
  id: string
  slug: string
  label: string
  description?: string | null
  priceDeltaCents: number
  isDefault: boolean
  sortOrder: number
}

/** Commercial product option group from catalog BFF. */
export type ProductOptionGroup = {
  id: string
  slug: string
  name: string
  description?: string | null
  inputType: 'SINGLE_SELECT' | 'BOOLEAN'
  isRequired: boolean
  sortOrder: number
  values: ProductOptionValue[]
}

/** Full product detail from BFF (extends list shape). */
export type ProductDetail = CatalogProduct & {
  description?: string | null
  productionTimeDays?: number | null
  seoTitle?: string | null
  seoDescription?: string | null
  customizationRules: ProductCustomizationRule[]
  optionGroups: ProductOptionGroup[]
}

/** Legacy `Product` UI model plus BFF variants and commercial options for PDP. */
export type StorefrontProductDetail = Product & {
  variants: ProductVariantOption[]
  basePriceCents: number
  optionGroups: ProductOptionGroup[]
}

/** Customization area from product detail BFF. */
export type ProductCustomizationArea = {
  id: string
  slug: string
  name: string
  description?: string | null
}

/** Customization option from product detail BFF. */
export type ProductCustomizationOption = {
  id: string
  slug: string
  name: string
  basePriceCents: number
  pricePerCmCents?: number | null
}

/** Customization rule from product detail BFF. */
export type ProductCustomizationRule = {
  id: string
  enabled: boolean
  maxWidthCm?: number | null
  maxHeightCm?: number | null
  minQuantity?: number | null
  basePriceCents: number
  pricePerCmCents?: number | null
  extraProductionDays?: number | null
  allowedFileTypes: string[]
  validationMessage?: string | null
  area: ProductCustomizationArea
  option: ProductCustomizationOption
}

export type ProductBySlugQueryData = {
  productBySlug: ProductDetail | null
}

export type CustomizationRulesByProductQueryData = {
  customizationRulesByProduct: ProductCustomizationRule[]
}

export type {
  CatalogColor,
  CatalogProductImage,
  CatalogProductType,
  CatalogProductVariant,
  CatalogSize,
}
