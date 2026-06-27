export type AdminColor = {
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

export type AdminColorsListVariables = {
  includeInactive?: boolean
}

export type CreateAdminColorInput = {
  slug: string
  name: string
  hex: string
  isFabricColor?: boolean
  isProductColor?: boolean
  isGeneralColor?: boolean
  isActive?: boolean
  sortOrder?: number
}

export type UpdateAdminColorInput = {
  slug?: string
  name?: string
  hex?: string
  isFabricColor?: boolean
  isProductColor?: boolean
  isGeneralColor?: boolean
  isActive?: boolean
  sortOrder?: number
}
