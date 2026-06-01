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

export type CustomizerProductData = {
  id: string
  name: string
  slug: string
  basePriceCents: number
  images: CatalogProductImage[]
  colors: CustomizerProductColor[]
  sizes: CustomizerProductSize[]
  variants: CustomizerProductVariant[]
  rules: ProductCustomizationRule[]
  customizationAreas: { slug: string; name: string }[]
  customizationAvailability: CustomizerAreaOptionAvailability[]
}
