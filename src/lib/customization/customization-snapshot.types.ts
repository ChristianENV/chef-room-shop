export type SnapshotColor = {
  id: string | null
  name: string | null
  hex: string | null
  label?: string | null
}

export type SnapshotSize = {
  id: string | null
  name: string | null
  label: string | null
}

export type FabricColorSnapshot = {
  name: string | null
  hex: string | null
}

/** Stable personalization snapshot used in cart, checkout, and orders. */
export type CustomizationSnapshotData = {
  designId: string | null
  previewUrl: string | null
  previewBackUrl: string | null
  selectedVariantId: string | null
  selectedSize: SnapshotSize
  selectedColor: SnapshotColor
  fabricColor: FabricColorSnapshot
  detailColor: FabricColorSnapshot
  elements: Array<Record<string, unknown>>
  selectedOptions: Record<string, unknown>
  customizationPriceCents: number | null
  summary: string[]
  areas: string[]
  hasLogo: boolean
  hasEmbroidery: boolean
  embroideredName: string | null
}

export type ProductSnapshotLike = {
  productId?: string
  variantId?: string | null
  slug?: string
  name?: string
  sku?: string | null
  imageUrl?: string | null
  productType?: string | null
  colorName?: string | null
  colorHex?: string | null
  sizeName?: string | null
}
