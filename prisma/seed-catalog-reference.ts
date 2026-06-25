/** Canonical catalog reference slugs shared by base seed and canonical product seed. */

import {
  getAllowedVariantColorSlugsForProductType,
  PRODUCT_TYPE_VARIANT_COLOR_SLUGS,
} from '../src/config/catalog-colors'

export { PRODUCT_TYPE_VARIANT_COLOR_SLUGS }

export const APPAREL_SIZE_SLUGS = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const

export const SHOE_SIZE_SLUGS = ['22', '23', '24', '25', '26', '27', '28', '29', '30'] as const

/** @deprecated Prefer getAllowedVariantColorSlugsForProductType('chef-jacket') */
export const GARMENT_COLOR_SLUGS = PRODUCT_TYPE_VARIANT_COLOR_SLUGS['chef-jacket']

/** @deprecated Prefer getAllowedVariantColorSlugsForProductType('apron') */
export const MANDIL_COLOR_SLUGS = PRODUCT_TYPE_VARIANT_COLOR_SLUGS.apron

/** @deprecated Prefer getAllowedVariantColorSlugsForProductType('pants') */
export const PANT_COLOR_SLUGS = PRODUCT_TYPE_VARIANT_COLOR_SLUGS.pants

/** @deprecated Prefer getAllowedVariantColorSlugsForProductType('shoes') */
export const SHOE_COLOR_SLUGS = PRODUCT_TYPE_VARIANT_COLOR_SLUGS.shoes

export function variantColorSlugsForProductType(typeSlug: string): readonly string[] {
  return getAllowedVariantColorSlugsForProductType(typeSlug)
}

export type ApparelSizeSlug = (typeof APPAREL_SIZE_SLUGS)[number]
export type ShoeSizeSlug = (typeof SHOE_SIZE_SLUGS)[number]
export type GarmentColorSlug = (typeof GARMENT_COLOR_SLUGS)[number]
