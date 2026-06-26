/** GraphQL-facing product type (storefront catalog). */
export type CatalogProductTypeGql = {
  id: string
  slug: string
  shopSlug: string | null
  name: string
  nameEs: string
  nameEn: string | null
  description: string | null
  sortOrder: number | null
  isActive: boolean
  showInNav: boolean
  cardImageUrl: string | null
  cardImageAlt: string | null
}

export type CatalogProductImageGql = {
  id: string
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number | null
  isPrimary: boolean
}

export type CatalogColorGql = {
  id: string
  name: string
  slug: string
  hexCode: string
  sortOrder: number | null
}

export type CatalogSizeGql = {
  id: string
  name: string
  slug: string
  sortOrder: number | null
}

export type CatalogProductVariantGql = {
  id: string
  sku: string
  variantName: string | null
  priceCents: number
  stockQty: number | null
  color: CatalogColorGql | null
  size: CatalogSizeGql | null
  isActive: boolean
}

export type CatalogCustomizationAreaGql = {
  id: string
  slug: string
  name: string
  description: string | null
}

export type CatalogCustomizationOptionGql = {
  id: string
  slug: string
  name: string
  basePriceCents: number
  pricePerCmCents: number | null
}

export type CatalogProductCustomizationRuleGql = {
  id: string
  enabled: boolean
  maxWidthCm: number | null
  maxHeightCm: number | null
  minQuantity: number | null
  basePriceCents: number
  pricePerCmCents: number | null
  extraProductionDays: number | null
  allowedFileTypes: string[]
  validationMessage: string | null
  area: CatalogCustomizationAreaGql
  option: CatalogCustomizationOptionGql
}

export type CatalogProductModel3dGql = {
  id: string
  url: string
  publicId: string
  fileName: string
  originalFileName: string | null
  sizeBytes: number
  originalSizeBytes: number | null
  compressionRatio: number | null
  format: string
  metadataJson: unknown | null
  materialHintsJson: unknown | null
  meshHintsJson: unknown | null
  anchorsJson: unknown | null
}

export type CatalogProductGql = {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  description: string | null
  basePriceCents: number
  currency: string
  productionTimeDays: number | null
  isCustomizable: boolean
  status: string
  seoTitle: string | null
  seoDescription: string | null
  seoImageId: string | null
  productType: CatalogProductTypeGql
  images: CatalogProductImageGql[]
  variants: CatalogProductVariantGql[]
  customizationRules: CatalogProductCustomizationRuleGql[]
  model3d: CatalogProductModel3dGql | null
}

export type ProductsFilterInput = {
  productTypeSlug?: string | null
  colorSlug?: string | null
  sizeSlug?: string | null
  isCustomizable?: boolean | null
  search?: string | null
}

export type ProductsSortInput = {
  field?: string | null
  direction?: string | null
}

export type GetProductsInput = {
  filter?: ProductsFilterInput | null
  sort?: ProductsSortInput | null
  limit?: number | null
  offset?: number | null
}

export type ProductsPayloadGql = {
  items: CatalogProductGql[]
  total: number
}
