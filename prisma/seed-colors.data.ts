import { DEFAULT_FABRIC_COLORS } from '../src/features/storefront/customizer/constants/fabric-colors'

export type SeedColorRow = {
  slug: string
  name: string
  hex: string
  isFabricColor: boolean
  isProductColor: boolean
  isGeneralColor: boolean
  isActive: boolean
  sortOrder: number
}

/** Canonical sellable product colors — flags match migration backfill. */
export const SEED_PRODUCT_COLORS: SeedColorRow[] = [
  {
    slug: 'black',
    name: 'Negro',
    hex: '#111111',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: true,
    isActive: true,
    sortOrder: 10,
  },
  {
    slug: 'white',
    name: 'Blanco',
    hex: '#FFFFFF',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 20,
  },
  {
    slug: 'chef-blue',
    name: 'Azul Chef Room',
    hex: '#2B3280',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 30,
  },
  {
    slug: 'warm-gray',
    name: 'Gris cálido',
    hex: '#E2E0DB',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 40,
  },
]

const PRODUCT_COLOR_SLUGS = new Set(SEED_PRODUCT_COLORS.map((color) => color.slug))

/**
 * Fabric palette colors that are not already product-color slugs.
 * `chef-room-blue` stays fabric-only; sellable SKU uses `chef-blue`.
 */
export const SEED_FABRIC_ONLY_COLORS: SeedColorRow[] = DEFAULT_FABRIC_COLORS.filter(
  (fabric) => !PRODUCT_COLOR_SLUGS.has(fabric.id),
).map((fabric, index) => ({
  slug: fabric.id,
  name: fabric.name,
  hex: fabric.hex,
  isFabricColor: true,
  isProductColor: false,
  isGeneralColor: false,
  isActive: true,
  sortOrder: 100 + index * 10,
}))

export const SEED_ALL_COLORS: SeedColorRow[] = [...SEED_PRODUCT_COLORS, ...SEED_FABRIC_ONLY_COLORS]
