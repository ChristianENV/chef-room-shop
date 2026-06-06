import type { DesignZone, Layer } from '../types/customizer.types'
import {
  CUSTOMIZER_EMBROIDERY_PRICING_CENTS,
  CUSTOMIZER_PRICING_LABELS,
} from './customizer-pricing.constants'
import { isBackZone, isChestZone } from './calculate-customizer-price'

export type EstimatedElementPriceInput = {
  type: 'text' | 'logo'
  zone?: DesignZone | string
  layers?: Layer[]
}

export type EstimatedElementPrice = {
  amountCents: number
  label: string
  hint?: string
  formatted: string
}

function formatAddon(cents: number): string {
  return `+$${(cents / 100).toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function hasChestLogoWithAsset(layers: Layer[] = []): boolean {
  return layers.some(
    (layer) =>
      layer.type === 'logo' &&
      layer.visible !== false &&
      isChestZone(layer.zone) &&
      Boolean(layer.assetPublicId?.trim() || layer.assetUrl?.trim()),
  )
}

export function getEstimatedElementPrice(input: EstimatedElementPriceInput): EstimatedElementPrice {
  if (input.type === 'text') {
    const amountCents = CUSTOMIZER_EMBROIDERY_PRICING_CENTS.TEXT
    return {
      amountCents,
      label: CUSTOMIZER_PRICING_LABELS.TEXT,
      formatted: formatAddon(amountCents),
    }
  }

  if (isBackZone(input.zone)) {
    const hasChestLogo = hasChestLogoWithAsset(input.layers)
    const amountCents = hasChestLogo
      ? CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_SAME_AS_CHEST
      : CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_PRIMARY_OR_NEW

    return {
      amountCents,
      label: hasChestLogo
        ? CUSTOMIZER_PRICING_LABELS.BACK_LOGO_SAME_AS_CHEST
        : CUSTOMIZER_PRICING_LABELS.BACK_LOGO,
      hint: hasChestLogo
        ? 'Si usas el mismo logo del pecho'
        : 'El logo en espalda tiene precio especial si usas el mismo logo del pecho.',
      formatted: formatAddon(amountCents),
    }
  }

  const amountCents = CUSTOMIZER_EMBROIDERY_PRICING_CENTS.CHEST_LOGO
  return {
    amountCents,
    label: CUSTOMIZER_PRICING_LABELS.CHEST_LOGO,
    formatted: formatAddon(amountCents),
  }
}
