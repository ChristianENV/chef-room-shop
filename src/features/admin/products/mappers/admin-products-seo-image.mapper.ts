import type { AdminProductImageUi } from '../types/admin-products-ui.types'

export type SeoImagePickerOption = {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  isSelected: boolean
}

export function mapSeoImagePickerOptions(
  images: AdminProductImageUi[],
  seoImageId: string | null,
): SeoImagePickerOption[] {
  return images.map((image) => ({
    id: image.id,
    url: image.url,
    alt: image.alt,
    isPrimary: image.isPrimary,
    isSelected: seoImageId !== null && image.id === seoImageId,
  }))
}
