export type ColorFormValues = {
  slug: string
  name: string
  hex: string
  isFabricColor: boolean
  isProductColor: boolean
  isGeneralColor: boolean
  isActive: boolean
  sortOrder: number
}

export type AdminColorTableRow = {
  id: string
  slug: string
  name: string
  hexCode: string
  scopes: string[]
  isActive: boolean
  sortOrder: number
  statusLabel: string
}
