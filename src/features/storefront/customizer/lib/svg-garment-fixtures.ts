import type { ViewAngle } from '../types/customizer.types'

/** Test id for the SVG 2D renderer root element. */
export const SVG_2D_RENDERER_TEST_ID = 'customizer-svg-2d-renderer'

/** Top-level SVG groups, one per garment view. */
export type GarmentViewId = 'view-front' | 'view-back'

export const GARMENT_VIEW_IDS: readonly GarmentViewId[] = ['view-front', 'view-back'] as const

/**
 * Stable part identifiers used inside each view group. This list is the Stage 1
 * placeholder contract; the final Illustrator asset contract (Stage 2) will
 * extend it. Renderers reference parts via `data-part` so the same part can
 * appear in multiple views without duplicating DOM ids.
 */
export const GARMENT_PART_IDS = [
  'vis-outline',
  'vis-seams',
  'vis-buttons',
  'zone-color-body',
  'zone-color-collar',
  'zone-logo-left-chest',
  'zone-text-back-center',
] as const

export type GarmentPartId = (typeof GARMENT_PART_IDS)[number]

/** Parts whose fill is driven by the current garment colors. */
export type GarmentColorZoneId = 'zone-color-body' | 'zone-color-collar'

export type GarmentColors = {
  baseColor: string
  detailColor: string
}

/** Maps a {@link ViewAngle} to the SVG view group that should be visible. */
export function resolveGarmentViewId(viewAngle: ViewAngle): GarmentViewId {
  return viewAngle === 'back' ? 'view-back' : 'view-front'
}

/** Whether a given view group is the active one for the current angle. */
export function isGarmentViewActive(viewAngle: ViewAngle, viewId: GarmentViewId): boolean {
  return resolveGarmentViewId(viewAngle) === viewId
}

/**
 * Resolves the fill color for a color zone. `zone-color-collar` follows the
 * detail color; every other color zone follows the base fabric color.
 */
export function resolveColorZoneFill(zoneId: GarmentColorZoneId, colors: GarmentColors): string {
  return zoneId === 'zone-color-collar' ? colors.detailColor : colors.baseColor
}
