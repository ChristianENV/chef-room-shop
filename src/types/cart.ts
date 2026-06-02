/** Product category slug used in cart preview UI. */
export type CartPreviewCategory = 'filipina' | 'mandil' | 'pantalon'

/** Summary of customization applied to a cart line item. */
export type CartPreviewCustomizationSummary = {
  hasLogo?: boolean
  hasEmbroidery?: boolean
  embroideredName?: string
  areas?: string[]
  lines?: string[]
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
  quantity: number
  unitPrice: number
  customizationPrice?: number
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
  totalItems: number
}

/** Full cart page state (preview totals + checkout shipping). */
export type CartPageState = CartPreview & {
  shipping: number
  total: number
}
