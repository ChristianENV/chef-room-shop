import type { AdminCustomizationPricingPreviewGql } from './admin-customization.types'

export type CustomizationPricingPreviewParams = {
  basePriceCents: number
  pricePerCmCents: number
  widthCm: number
  heightCm: number
  extraProductionDays: number
}

/**
 * Calculates a simple v1 customization pricing preview (base + area by cm²).
 */
export function calculateCustomizationPricingPreview(
  params: CustomizationPricingPreviewParams,
): AdminCustomizationPricingPreviewGql {
  const { basePriceCents, pricePerCmCents, widthCm, heightCm, extraProductionDays } =
    params

  const areaCm2 = widthCm > 0 && heightCm > 0 ? widthCm * heightCm : 0
  const sizeFactorCents = Math.round(areaCm2 * pricePerCmCents)
  const totalExtraCents = basePriceCents + sizeFactorCents

  return {
    basePriceCents,
    areaPriceCents: basePriceCents,
    sizeFactorCents,
    extraProductionDays,
    totalExtraCents,
    formulaLabel: 'Base + área personalizada',
  }
}
