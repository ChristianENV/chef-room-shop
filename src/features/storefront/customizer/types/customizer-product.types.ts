import type {
  CatalogProductImage,
  ProductCustomizationRule,
} from '@/src/features/storefront/products/types'

export type CustomizerProductColor = {
  id: string
  name: string
  hex: string
}

export type CustomizerProductSize = {
  id: string
  name: string
}

export type CustomizerProductVariant = {
  id: string
  colorId: string
  sizeId: string
  stockQty: number
  isActive: boolean
}

export type CustomizerAreaOptionAvailability = {
  areaSlug: string
  optionSlug: string
  enabled: boolean
}

export type CustomizerProductModel3d = {
  id: string
  url: string
  publicId: string
  fileName: string
  sizeBytes: number
  format: string
  materialHintsJson: unknown | null
  meshHintsJson: unknown | null
  anchorsJson: unknown | null
}

export type CustomizerProductData = {
  id: string
  name: string
  slug: string
  productTypeSlug: string
  productTypeName: string
  basePriceCents: number
  images: CatalogProductImage[]
  colors: CustomizerProductColor[]
  sizes: CustomizerProductSize[]
  variants: CustomizerProductVariant[]
  rules: ProductCustomizationRule[]
  customizationAreas: { slug: string; name: string }[]
  customizationAvailability: CustomizerAreaOptionAvailability[]
  model3d: CustomizerProductModel3d | null
}
