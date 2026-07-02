'use client'

import { useCustomizerStore } from '../store/customizer.store'
import { SVG_2D_RENDERER_TEST_ID } from '../lib/svg-garment-fixtures'
import { ChefJacketWireframe } from '../assets/svg/chef-jacket-wireframe'
import { ViewportElementOverlay } from './viewport-element-overlay'

/**
 * Stage 1 SVG-based 2D renderer. Renders a temporary wireframe garment as the
 * base layer and reuses the existing {@link ViewportElementOverlay} for design
 * elements. Reads live design state (colors + view angle) from the customizer
 * store; element transforms are still driven by the right-inspector sliders.
 *
 * Intentionally out of scope for this stage: clip/mask constraints, direct
 * drag/resize/rotate handles, side view, and preview capture (add-to-cart still
 * requires the 3D renderer for previews).
 */
export function Svg2DRenderer() {
  const baseColor = useCustomizerStore((state) => state.baseColor)
  const detailColor = useCustomizerStore((state) => state.detailColor)
  const viewAngle = useCustomizerStore((state) => state.viewAngle)

  return (
    <div
      data-testid={SVG_2D_RENDERER_TEST_ID}
      data-view-angle={viewAngle}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#f4f1ea] via-[#ece7dc] to-[#e4ddcd]"
    >
      <div className="relative z-10 flex h-full max-h-[82%] w-full items-center justify-center py-6">
        <ChefJacketWireframe
          viewAngle={viewAngle}
          baseColor={baseColor}
          detailColor={detailColor}
        />
      </div>
      <ViewportElementOverlay />
    </div>
  )
}
