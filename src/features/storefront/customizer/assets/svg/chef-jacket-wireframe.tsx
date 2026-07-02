import { cn } from '@/lib/utils'
import type { ViewAngle } from '../../types/customizer.types'
import {
  isGarmentViewActive,
  resolveColorZoneFill,
  type GarmentColors,
} from '../../lib/svg-garment-fixtures'

/**
 * Temporary placeholder chef-jacket illustration for the 2D renderer.
 *
 * This is NOT the final Illustrator artwork. It exists to prove the Stage 1
 * plumbing: front/back view switching, per-zone color fills, overlay
 * positioning, and responsive fitting. The final asset (Stage 2) will replace
 * this component while keeping the same group / part contract:
 *
 * - view groups:  `view-front`, `view-back`
 * - visual parts: `vis-outline`, `vis-seams`, `vis-buttons`
 * - color zones:  `zone-color-body`, `zone-color-collar`
 * - content zones: `zone-logo-left-chest`, `zone-text-back-center`
 *
 * Parts are tagged with `data-part` so the same part can appear in multiple
 * views without duplicating DOM ids.
 */

const FRONT_BODY_PATH =
  'M104 104 L66 128 L82 162 L92 160 L92 372 Q92 384 104 384 L216 384 Q228 384 228 372 L228 160 L238 162 L254 128 L216 104 Q188 90 160 90 Q132 90 104 104 Z'

const BACK_BODY_PATH =
  'M104 104 L66 128 L82 162 L92 160 L92 372 Q92 384 104 384 L216 384 Q228 384 228 372 L228 160 L238 162 L254 128 L216 104 Q188 96 160 96 Q132 96 104 104 Z'

const OUTLINE_STROKE = 'rgba(15, 15, 24, 0.55)'
const SEAM_STROKE = 'rgba(15, 15, 24, 0.28)'
const ZONE_MARKER_STROKE = 'rgba(120, 130, 150, 0.9)'

export type ChefJacketWireframeProps = {
  viewAngle: ViewAngle
  baseColor: string
  detailColor: string
  className?: string
}

export function ChefJacketWireframe({
  viewAngle,
  baseColor,
  detailColor,
  className,
}: ChefJacketWireframeProps) {
  const colors: GarmentColors = { baseColor, detailColor }
  const bodyFill = resolveColorZoneFill('zone-color-body', colors)
  const collarFill = resolveColorZoneFill('zone-color-collar', colors)

  const frontActive = isGarmentViewActive(viewAngle, 'view-front')
  const backActive = isGarmentViewActive(viewAngle, 'view-back')

  return (
    <svg
      viewBox="0 0 320 440"
      role="img"
      aria-label="Boceto de filipina para vista previa 2D"
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-full max-h-full w-auto max-w-full', className)}
    >
      {/* Front view */}
      <g
        id="view-front"
        data-testid="customizer-svg-view-front"
        data-view="front"
        data-active={frontActive}
        style={{ display: frontActive ? undefined : 'none' }}
      >
        <g data-part="zone-color-body" id="zone-color-body">
          <path d={FRONT_BODY_PATH} fill={bodyFill} />
        </g>

        <g data-part="zone-color-collar" id="zone-color-collar">
          <path
            d="M130 96 L160 120 L190 96 L206 108 L160 146 L114 108 Z"
            fill={collarFill}
            stroke={SEAM_STROKE}
            strokeWidth={1.5}
          />
        </g>

        <g data-part="vis-seams" id="vis-seams" fill="none" stroke={SEAM_STROKE} strokeWidth={1.5}>
          <line x1="160" y1="146" x2="160" y2="372" />
          <path d="M66 128 L92 160" />
          <path d="M254 128 L228 160" />
        </g>

        <g data-part="vis-buttons" id="vis-buttons" fill={collarFill}>
          <circle cx="140" cy="176" r="4" />
          <circle cx="140" cy="216" r="4" />
          <circle cx="140" cy="256" r="4" />
          <circle cx="140" cy="296" r="4" />
          <circle cx="180" cy="176" r="4" />
          <circle cx="180" cy="216" r="4" />
          <circle cx="180" cy="256" r="4" />
          <circle cx="180" cy="296" r="4" />
        </g>

        <g data-part="vis-outline" id="vis-outline" fill="none">
          <path d={FRONT_BODY_PATH} stroke={OUTLINE_STROKE} strokeWidth={2.5} />
        </g>

        <rect
          id="zone-logo-left-chest"
          data-part="zone-logo-left-chest"
          x="178"
          y="164"
          width="42"
          height="34"
          rx="4"
          fill="none"
          stroke={ZONE_MARKER_STROKE}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      </g>

      {/* Back view */}
      <g
        id="view-back"
        data-testid="customizer-svg-view-back"
        data-view="back"
        data-active={backActive}
        style={{ display: backActive ? undefined : 'none' }}
      >
        <g data-part="zone-color-body">
          <path d={BACK_BODY_PATH} fill={bodyFill} />
        </g>

        <g data-part="zone-color-collar">
          <path
            d="M126 98 Q160 118 194 98 L200 110 Q160 132 120 110 Z"
            fill={collarFill}
            stroke={SEAM_STROKE}
            strokeWidth={1.5}
          />
        </g>

        <g data-part="vis-seams" fill="none" stroke={SEAM_STROKE} strokeWidth={1.5}>
          <line x1="160" y1="118" x2="160" y2="372" />
          <path d="M66 128 L92 160" />
          <path d="M254 128 L228 160" />
        </g>

        <g data-part="vis-outline" fill="none">
          <path d={BACK_BODY_PATH} stroke={OUTLINE_STROKE} strokeWidth={2.5} />
        </g>

        <rect
          id="zone-text-back-center"
          data-part="zone-text-back-center"
          x="112"
          y="196"
          width="96"
          height="52"
          rx="4"
          fill="none"
          stroke={ZONE_MARKER_STROKE}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
      </g>
    </svg>
  )
}
