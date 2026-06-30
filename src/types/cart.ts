/** Product category slug used in cart preview UI. */
export type CartPreviewCategory = 'filipina' | 'mandil' | 'pantalon'

/** Summary of customization applied to a cart line item. */
export type CartPreviewCustomizationSummary = {
  hasLogo?: boolean
  hasEmbroidery?: boolean
  embroideredName?: string
  areas?: string[]
  lines?: string[]
  personalizationLine?: string
}

/** Commercial product option snapshot for cart display. */
export type CartPreviewCommercialOption = {
  groupId: string
  groupSlug: string
  groupName: string
  valueId: string
  valueSlug: string
  valueLabel: string
  priceDeltaCents: number
}

/** Lightweight cart line item for navbar popover preview. */
export type CartPreviewItem = {
  id: string
  productId: string
  productSlug: string
  productName: string
  category: CartPreviewCategory
  imageUrl?: string
  size: string
  colorName: string
  colorHex: string
  detailColorName?: string | null
  detailColorHex?: string | null
  quantity: number
  unitPrice: number
  customizationPrice?: number
  optionPrice?: number
  lineTotal?: number
  commercialOptionsSnapshot: CartPreviewCommercialOption[]
  isCustomized: boolean
  designId?: string
  designPreviewUrl?: string
  customizationSummary?: CartPreviewCustomizationSummary
}

/** Cart snapshot for mini-cart / popover display. */
export type CartPreview = {
  items: CartPreviewItem[]
  subtotal: number
  customizationTotal: number
  optionTotal: number
  totalItems: number
}

/** Full cart page state (preview totals + checkout shipping). */
export type CartPageState = CartPreview & {
  shipping: number
  total: number
}
