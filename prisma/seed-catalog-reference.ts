/** Canonical catalog reference slugs shared by base seed and canonical product seed. */

export const APPAREL_SIZE_SLUGS = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const

export const SHOE_SIZE_SLUGS = ['22', '23', '24', '25', '26', '27', '28', '29', '30'] as const

export const GARMENT_COLOR_SLUGS = ['black', 'white', 'chef-blue', 'warm-gray'] as const

export const MANDIL_COLOR_SLUGS = ['black', 'white'] as const

export const PANT_COLOR_SLUGS = ['black'] as const

export type ApparelSizeSlug = (typeof APPAREL_SIZE_SLUGS)[number]
export type ShoeSizeSlug = (typeof SHOE_SIZE_SLUGS)[number]
export type GarmentColorSlug = (typeof GARMENT_COLOR_SLUGS)[number]
