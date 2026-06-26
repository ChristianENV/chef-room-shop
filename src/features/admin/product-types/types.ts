export type AdminProductType = {
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
  productCount: number
  activeProductCount: number
  createdAt: string
  updatedAt: string
}

export type AdminProductTypesListVariables = {
  includeInactive?: boolean | null
}

export type CreateAdminProductTypeInput = {
  slug: string
  shopSlug?: string | null
  nameEs: string
  nameEn?: string | null
  description?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
  showInNav?: boolean | null
}

export type UpdateAdminProductTypeInput = {
  slug?: string
  shopSlug?: string | null
  nameEs?: string
  nameEn?: string | null
  description?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
  showInNav?: boolean | null
}
