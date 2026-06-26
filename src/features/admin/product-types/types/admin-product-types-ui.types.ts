export type CategoryFormValues = {
  nameEs: string
  nameEn: string
  slug: string
  shopSlug: string
  description: string
  sortOrder: number
  isActive: boolean
  showInNav: boolean
  cardImageAlt: string
}

export type CategoryFormFieldErrors = Partial<
  Record<'nameEs' | 'slug' | 'shopSlug' | 'sortOrder' | 'form', string>
>

export type AdminCategoryTableRow = {
  id: string
  name: string
  slug: string
  shopSlug: string | null
  shopSlugLabel: string
  productCount: number
  activeProductCount: number
  showInNav: boolean
  showInNavLabel: string
  isActive: boolean
  statusLabel: string
  sortOrder: number | null
  sortOrderLabel: string
}
