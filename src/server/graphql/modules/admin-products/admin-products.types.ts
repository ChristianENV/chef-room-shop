export type AdminProductTypeGql = {
  id: string
  slug: string
  name: string
  description: string | null
  sortOrder: number | null
  isActive: boolean
}

export type AdminColorGql = {
  id: string
  name: string
  slug: string
  hexCode: string
  isActive: boolean
  sortOrder: number | null
}

export type AdminSizeGql = {
  id: string
  name: string
  slug: string
  sortOrder: number | null
  isActive: boolean
}

export type AdminProductImageGql = {
  id: string
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number | null
  isPrimary: boolean
}

export type AdminProductVariantGql = {
  id: string
  sku: string
  variantName: string | null
  priceCents: number
  stockQty: number | null
  color: AdminColorGql
  size: AdminSizeGql
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminProductGql = {
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
  productType: AdminProductTypeGql
  images: AdminProductImageGql[]
  variants: AdminProductVariantGql[]
}

export type AdminProductsPayloadGql = {
  items: AdminProductGql[]
  total: number
}

export type AdminProductFormOptionsGql = {
  productTypes: AdminProductTypeGql[]
  colors: AdminColorGql[]
  sizes: AdminSizeGql[]
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

export type AdminProductsListInput = {
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
