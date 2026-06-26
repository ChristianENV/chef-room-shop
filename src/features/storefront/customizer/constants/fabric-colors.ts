import type { NamedColor } from '../lib/customizer-defaults'
import { isKnownCatalogColorSlug } from '@/src/config/catalog-colors'

export type FabricColorGroup = 'Esenciales' | 'Neutros' | 'Contemporáneos'

export type FabricColor = {
  id: string
  name: string
  hex: string
  group: FabricColorGroup
}

export const DEFAULT_FABRIC_COLORS = [
  { id: 'chef-white', name: 'Blanco chef', hex: '#F7F5EF', group: 'Esenciales' },
  { id: 'warm-gray', name: 'Warm Gray', hex: '#E2E0DB', group: 'Esenciales' },
  { id: 'chef-room-blue', name: 'Azul Chef Room', hex: '#2B3280', group: 'Esenciales' },
  { id: 'deep-navy', name: 'Navy profundo', hex: '#111735', group: 'Esenciales' },
  { id: 'charcoal-black', name: 'Negro carbón', hex: '#171717', group: 'Esenciales' },
  { id: 'graphite-gray', name: 'Gris grafito', hex: '#3B3F46', group: 'Esenciales' },
  { id: 'sand', name: 'Arena', hex: '#C8BBA8', group: 'Neutros' },
  { id: 'oat-beige', name: 'Beige avena', hex: '#D8CEBD', group: 'Neutros' },
  { id: 'taupe', name: 'Taupe', hex: '#8A7D70', group: 'Neutros' },
  { id: 'chocolate', name: 'Chocolate', hex: '#4A3328', group: 'Neutros' },
  { id: 'olive-green', name: 'Verde olivo', hex: '#4B5A3C', group: 'Contemporáneos' },
  { id: 'petrol-blue', name: 'Azul petróleo', hex: '#1F4E5F', group: 'Contemporáneos' },
  { id: 'wine', name: 'Vino', hex: '#6B1F2A', group: 'Contemporáneos' },
  { id: 'terracotta', name: 'Terracota', hex: '#A3543C', group: 'Contemporáneos' },
] as const satisfies readonly FabricColor[]

/**
 * Explicit fabric id → catalog Color.slug mapping (confirmed hex/name pairs only).
 * Fabric-only colors are omitted — they must not auto-expand into variant SKUs.
 */
export const FABRIC_COLOR_TO_CATALOG_COLOR_SLUG = {
  'chef-room-blue': 'chef-blue',
} as const

export type FabricColorCatalogSlugMap = typeof FABRIC_COLOR_TO_CATALOG_COLOR_SLUG

function normalizeFabricColorId(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, '-')
}

/**
 * Resolves a fabric palette id to a catalog Color slug when safely known.
 * Returns the input when it is already a catalog slug; null when unmapped.
 */
export function getCatalogColorSlugForFabricColor(fabricColorIdOrSlug: string): string | null {
  const normalized = normalizeFabricColorId(fabricColorIdOrSlug)
  const mapped = FABRIC_COLOR_TO_CATALOG_COLOR_SLUG[normalized as keyof FabricColorCatalogSlugMap]
  if (mapped) {
    return mapped
  }
  if (isKnownCatalogColorSlug(normalized)) {
    return normalized
  }
  return null
}

export const FABRIC_COLOR_GROUPS: FabricColorGroup[] = ['Esenciales', 'Neutros', 'Contemporáneos']

/** Restricted palette for detail/trim accents (vivos, cuello y puños). */
export const DETAIL_FABRIC_COLORS: NamedColor[] = [
  { id: 'detail-white', name: 'Blanco', hex: '#F7F5EF' },
  { id: 'detail-black', name: 'Negro', hex: '#171717' },
  { id: 'detail-gray', name: 'Gris', hex: '#9CA3AF' },
  { id: 'detail-orange', name: 'Naranja', hex: '#EA580C' },
]

/** Flat list for legacy `FALLBACK_COLORS` consumers. */
export function fabricColorsAsNamedColors(): NamedColor[] {
  return DEFAULT_FABRIC_COLORS.map(({ id, name, hex }) => ({ id, name, hex }))
}

export function groupFabricColors(
  colors: readonly FabricColor[],
): Record<FabricColorGroup, FabricColor[]> {
  return FABRIC_COLOR_GROUPS.reduce(
    (acc, group) => {
      acc[group] = colors.filter((color) => color.group === group)
      return acc
    },
    {} as Record<FabricColorGroup, FabricColor[]>,
  )
}
