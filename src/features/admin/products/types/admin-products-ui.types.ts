import type { AdminProduct, AdminProductFormOptions } from '../types'

export type AdminProductStatusUi = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export type StatusBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export type AdminProductTableRow = {
  id: string
  name: string
  slug: string
  identifier: string
  productTypeSlug: string
  productTypeLabel: string
  basePricePesos: number
  basePriceFormatted: string
  variantCount: number
  customizable: boolean
  status: AdminProductStatusUi
  statusLabel: string
  statusBadgeVariant: StatusBadgeVariant
  imageUrl: string | null
  imageAlt: string
  updatedAt: string
  updatedAtFormatted: string
  product: AdminProduct
}

export type AdminProductVariantUi = {
  id: string
  sku: string
  variantName: string | null
  colorId: string
  sizeId: string
  colorName: string
  sizeName: string
  pricePesos: number
  stockQty: number
  isActive: boolean
  isPersisted: boolean
}

export type AdminProductImageUi = {
  id: string
  url: string
  publicId: string | null
  alt: string
  sortOrder: number
  isPrimary: boolean
  isPersisted: boolean
}

export type ProductFormValues = {
  name: string
  slug: string
  shortDescription: string
  description: string
  productTypeId: string
  basePricePesos: number
  customizable: boolean
  status: AdminProductStatusUi
  seoTitle: string
  seoDescription: string
  variants: AdminProductVariantUi[]
  images: AdminProductImageUi[]
}

export type SelectOption = {
  value: string
  label: string
}

export type AdminProductFormSelectOptions = {
  productTypes: SelectOption[]
  colors: SelectOption[]
  sizes: SelectOption[]
  colorMeta: Record<string, { name: string; hexCode: string }>
}

export function mapFormOptionsToSelectOptions(
  options: AdminProductFormOptions,
): AdminProductFormSelectOptions {
  const colorMeta: AdminProductFormSelectOptions['colorMeta'] = {}
  options.colors.forEach((c) => {
    colorMeta[c.id] = { name: c.name, hexCode: c.hexCode }
  })

  return {
    productTypes: options.productTypes.map((t) => ({
      value: t.id,
      label: mapProductTypeSlugToLabel(t.slug, t.name),
    })),
    colors: options.colors.map((c) => ({
      value: c.id,
      label: c.name,
    })),
    sizes: options.sizes.map((s) => ({
      value: s.id,
      label: s.name,
    })),
    colorMeta,
  }
}

export function mapProductTypeSlugToLabel(slug: string, fallbackName?: string): string {
  const labels: Record<string, string> = {
    'chef-jacket': 'Filipina',
    apron: 'Mandil',
    pants: 'Pantalón',
  }
  return labels[slug] ?? fallbackName ?? slug
}
