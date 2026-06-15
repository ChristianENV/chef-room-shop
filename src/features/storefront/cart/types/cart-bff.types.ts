import type { AccountDesign } from '@/src/features/storefront/account/types'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'

export type CartProductSnapshot = {
  productId: string
  variantId: string | null
  slug: string
  name: string
  sku: string | null
  imageUrl: string | null
  productType: string | null
  colorName: string | null
  colorHex: string | null
  sizeName: string | null
}

export type CartCustomizationSnapshot = {
  designId: string | null
  previewUrl: string | null
  previewBackUrl?: string | null
  selectedVariantId?: string | null
  selectedSize?: {
    id: string | null
    name: string | null
    label: string | null
  }
  selectedColor?: {
    id: string | null
    name: string | null
    hex: string | null
    label?: string | null
  }
  fabricColor?: {
    name: string | null
    hex: string | null
  }
  detailColor?: {
    name: string | null
    hex: string | null
  }
  selectedOptions?: Record<string, unknown>
  elements?: Array<Record<string, unknown>>
  customizationPriceCents?: number | null
  summary: string[]
  areas: string[]
  hasLogo: boolean
  hasEmbroidery: boolean
  embroideredName: string | null
}

export type CartItem = {
  id: string
  productId: string
  productVariantId: string | null
  designId: string | null
  quantity: number
  unitPriceCents: number
  customizationPriceCents: number
  totalPriceCents: number
  product: CatalogProduct | null
  design: AccountDesign | null
  productSnapshot: CartProductSnapshot
  customizationSnapshot: CartCustomizationSnapshot
  createdAt: string
  updatedAt: string
}

export type Cart = {
  id: string
  status: string
  currency: string
  subtotalCents: number
  customizationTotalCents: number
  shippingCostCents: number
  discountTotalCents: number
  totalCents: number
  totalItems: number
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export type AddCartItemInput = {
  productId: string
  productVariantId?: string | null
  designId?: string | null
  quantity: number
}

export type UpdateCartItemQuantityInput = {
  itemId: string
  quantity: number
}
