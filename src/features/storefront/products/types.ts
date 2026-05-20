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
}

/** Legacy `Product` UI model plus BFF variants for cart mutations. */
export type StorefrontProductDetail = Product & {
  variants: ProductVariantOption[]
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

/** Full product detail from BFF (extends list shape). */
export type ProductDetail = CatalogProduct & {
  description?: string | null
  productionTimeDays?: number | null
  seoTitle?: string | null
  seoDescription?: string | null
  customizationRules: ProductCustomizationRule[]
}

export type ProductBySlugQueryData = {
  productBySlug: ProductDetail | null
}

export type {
  CatalogColor,
  CatalogProductImage,
  CatalogProductType,
  CatalogProductVariant,
  CatalogSize,
}
