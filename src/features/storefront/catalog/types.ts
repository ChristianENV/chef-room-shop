/** Product type reference from catalog BFF. */
export type CatalogProductType = {
  id: string
  slug: string
  name: string
  description?: string | null
  sortOrder?: number | null
}

/** Product image from catalog BFF. */
export type CatalogProductImage = {
  id: string
  url: string
  alt?: string | null
  sortOrder?: number | null
  isPrimary: boolean
}

/** Color on a variant from catalog BFF. */
export type CatalogColor = {
  id: string
  name: string
  slug: string
  hexCode: string
  sortOrder?: number | null
}

/** Size on a variant from catalog BFF. */
export type CatalogSize = {
  id: string
  name: string
  slug: string
  sortOrder?: number | null
}

/** Variant row from catalog BFF. */
export type CatalogProductVariant = {
  id: string
  sku: string
  variantName?: string | null
  priceCents: number
  stockQty?: number | null
  isActive: boolean
  color?: CatalogColor | null
  size?: CatalogSize | null
}

/** Product list item from catalog BFF. */
export type CatalogProductModel3d = {
  id: string
  url: string
  publicId: string
  fileName: string
  originalFileName?: string | null
  sizeBytes: number
  originalSizeBytes?: number | null
  compressionRatio?: number | null
  format: string
  materialHintsJson?: unknown | null
  meshHintsJson?: unknown | null
  anchorsJson?: unknown | null
}

export type CatalogProduct = {
  id: string
  slug: string
  name: string
  shortDescription?: string | null
  description?: string | null
  basePriceCents: number
  currency: string
  isCustomizable: boolean
  status: string
  productType: CatalogProductType
  images: CatalogProductImage[]
  variants: CatalogProductVariant[]
  model3d?: CatalogProductModel3d | null
}

/** Filter reference data for storefront catalog UI. */
export type CatalogFilters = {
  productTypes: CatalogProductType[]
  colors: CatalogColor[]
  sizes: CatalogSize[]
}

export type ProductsQueryData = {
  products: {
    total: number
    items: CatalogProduct[]
  }
}

export type ProductTypesQueryData = {
  productTypes: CatalogProductType[]
}

export type ColorsQueryData = {
  colors: CatalogColor[]
}

export type SizesQueryData = {
  sizes: CatalogSize[]
}

export type GetCatalogProductsInput = {
  productTypeSlug?: string
  colorSlug?: string
  sizeSlug?: string
  isCustomizable?: boolean
  search?: string
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}
