export type AdminProductType = {
  id: string
  slug: string
  name: string
  description: string | null
  sortOrder: number | null
  isActive: boolean
}

export type AdminColor = {
  id: string
  name: string
  slug: string
  hexCode: string
  isActive: boolean
  sortOrder: number | null
}

export type AdminSize = {
  id: string
  name: string
  slug: string
  sortOrder: number | null
  isActive: boolean
}

export type AdminProductImage = {
  id: string
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number | null
  isPrimary: boolean
}

export type AdminProductVariant = {
  id: string
  sku: string
  variantName: string | null
  priceCents: number
  stockQty: number | null
  color: AdminColor
  size: AdminSize
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminProduct = {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  description: string | null
  basePriceCents: number
  currency: string
  customizable: boolean
  status: string
  seoTitle: string | null
  seoDescription: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  productType: AdminProductType
  images: AdminProductImage[]
  variants: AdminProductVariant[]
}

export type AdminProductsPayload = {
  items: AdminProduct[]
  total: number
}

export type AdminProductFormOptions = {
  productTypes: AdminProductType[]
  colors: AdminColor[]
  sizes: AdminSize[]
}

export type AdminProductsFilterInput = {
  search?: string | null
  productTypeSlug?: string | null
  status?: string | null
  customizable?: boolean | null
  includeArchived?: boolean | null
}

export type AdminProductsSortInput = {
  field?: string | null
  direction?: string | null
}

export type AdminProductsListVariables = {
  filter?: AdminProductsFilterInput | null
  sort?: AdminProductsSortInput | null
  limit?: number | null
  offset?: number | null
}

export type AdminProductInput = {
  name: string
  slug?: string | null
  shortDescription?: string | null
  description?: string | null
  productTypeId: string
  basePriceCents: number
  currency?: string | null
  customizable?: boolean | null
  status?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}

export type AdminProductVariantInput = {
  id?: string | null
  productId: string
  sku?: string | null
  variantName?: string | null
  colorId?: string | null
  sizeId?: string | null
  priceCents?: number | null
  stockQty?: number | null
  isActive?: boolean | null
}

export type AdminProductImageInput = {
  id?: string | null
  productId: string
  url: string
  publicId?: string | null
  alt?: string | null
  sortOrder?: number | null
  isPrimary?: boolean | null
}
