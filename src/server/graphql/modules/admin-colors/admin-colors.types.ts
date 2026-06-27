export type AdminColorGql = {
  id: string
  slug: string
  name: string
  hexCode: string
  isFabricColor: boolean
  isProductColor: boolean
  isGeneralColor: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type AdminColorsListInputGql = {
  includeInactive?: boolean | null
}

export type CreateAdminColorInputGql = {
  slug: string
  name: string
  hex: string
  isFabricColor?: boolean | null
  isProductColor?: boolean | null
  isGeneralColor?: boolean | null
  isActive?: boolean | null
  sortOrder?: number | null
}

export type UpdateAdminColorInputGql = {
  slug?: string
  name?: string
  hex?: string
  isFabricColor?: boolean | null
  isProductColor?: boolean | null
  isGeneralColor?: boolean | null
  isActive?: boolean | null
  sortOrder?: number | null
}
