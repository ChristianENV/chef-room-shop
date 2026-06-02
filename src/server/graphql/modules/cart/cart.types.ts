import type {
  Cart,
  CartItem,
  Color,
  CustomizationArea,
  CustomizationOption,
  Design,
  Product,
  ProductCustomizationRule,
  ProductImage,
  ProductType,
  ProductVariant,
  Size,
} from '@prisma/client'

import type { AccountDesignGql } from '../account/account.types'
import type { CatalogProductGql } from '../catalog/catalog.types'

export type CartProductSnapshotGql = {
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

export type CartCustomizationSnapshotGql = {
  designId: string | null
  previewUrl: string | null
  summary: string[]
  areas: string[]
  hasLogo: boolean
  hasEmbroidery: boolean
  embroideredName: string | null
}

export type CartItemGql = {
  id: string
  productId: string
  productVariantId: string | null
  designId: string | null
  quantity: number
  unitPriceCents: number
  customizationPriceCents: number
  totalPriceCents: number
  product: CatalogProductGql | null
  design: AccountDesignGql | null
  productSnapshot: CartProductSnapshotGql
  customizationSnapshot: CartCustomizationSnapshotGql
  createdAt: string
  updatedAt: string
}

export type CartGql = {
  id: string
  status: string
  currency: string
  subtotalCents: number
  customizationTotalCents: number
  shippingCostCents: number
  discountTotalCents: number
  totalCents: number
  totalItems: number
  items: CartItemGql[]
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

export type CartOwner = {
  userId: string | null
  guestSessionId: string | null
}

export type CartConfigSnapshotJson = {
  productSnapshot?: CartProductSnapshotGql
  customizationSnapshot?: CartCustomizationSnapshotGql
  designSnapshot?: {
    designId: string | null
    previewUrl: string | null
    previewBackUrl: string | null
    configJson: unknown
    elements: unknown[]
    selectedOptions: Record<string, unknown>
  }
  customizationPriceCents?: number
}

export type CartItemWithRelations = CartItem & {
  product: Product & {
    productType: ProductType
    images: ProductImage[]
    variants: (ProductVariant & { color: Color; size: Size })[]
    customizationRules: (ProductCustomizationRule & {
      area: CustomizationArea
      option: CustomizationOption
    })[]
  }
  productVariant: (ProductVariant & { color: Color; size: Size }) | null
  design: Design | null
}

export type CartWithRelations = Cart & {
  items: CartItemWithRelations[]
}
