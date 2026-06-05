/**
 * Manual unit checks for customizer embroidery pricing.
 * Run: pnpm exec tsx scripts/test-customizer-pricing.ts
 */
import {
  CUSTOMIZER_EMBROIDERY_PRICING_CENTS,
} from '../src/features/storefront/customizer/pricing/customizer-pricing.constants'
import { calculateCustomizerPrice } from '../src/features/storefront/customizer/pricing/calculate-customizer-price'
import type { CustomizerPricingElement } from '../src/features/storefront/customizer/pricing/calculate-customizer-price'

const BASE = 129_900

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function el(partial: CustomizerPricingElement): CustomizerPricingElement {
  return {
    id: partial.id,
    type: partial.type,
    visible: partial.visible ?? true,
    zone: partial.zone ?? 'pecho',
    text: partial.text,
    assetUrl: partial.assetUrl,
    assetPublicId: partial.assetPublicId,
  }
}

function runCase(name: string, elements: CustomizerPricingElement[], expectedCustomization: number) {
  const result = calculateCustomizerPrice({ basePriceCents: BASE, elements })
  assert(
    result.customizationPriceCents === expectedCustomization,
    `${name}: expected customization ${expectedCustomization}, got ${result.customizationPriceCents}`,
  )
  assert(
    result.totalPriceCents === BASE + expectedCustomization,
    `${name}: expected total ${BASE + expectedCustomization}, got ${result.totalPriceCents}`,
  )
  console.log(`✓ ${name}`)
}

try {
  runCase('sin personalización', [], 0)

  runCase('un texto', [el({ id: 't1', type: 'text', text: 'Chef Room' })], CUSTOMIZER_EMBROIDERY_PRICING_CENTS.TEXT)

  runCase(
    'logo pecho',
    [el({ id: 'l1', type: 'logo', zone: 'pecho', assetPublicId: 'logo-a' })],
    CUSTOMIZER_EMBROIDERY_PRICING_CENTS.CHEST_LOGO,
  )

  runCase(
    'logo espalda sin pecho',
    [el({ id: 'l2', type: 'logo', zone: 'espalda', assetPublicId: 'logo-b' })],
    CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_PRIMARY_OR_NEW,
  )

  runCase(
    'logo pecho + mismo logo espalda',
    [
      el({ id: 'l3', type: 'logo', zone: 'pecho', assetPublicId: 'logo-shared' }),
      el({ id: 'l4', type: 'logo', zone: 'espalda', assetPublicId: 'logo-shared' }),
    ],
    CUSTOMIZER_EMBROIDERY_PRICING_CENTS.CHEST_LOGO +
      CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_SAME_AS_CHEST,
  )

  runCase(
    'logo pecho + logo espalda distinto',
    [
      el({ id: 'l5', type: 'logo', zone: 'pecho', assetPublicId: 'logo-chest' }),
      el({ id: 'l6', type: 'logo', zone: 'espalda', assetPublicId: 'logo-back' }),
    ],
    CUSTOMIZER_EMBROIDERY_PRICING_CENTS.CHEST_LOGO +
      CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_PRIMARY_OR_NEW,
  )

  runCase(
    'texto + logo pecho + mismo logo espalda',
    [
      el({ id: 't2', type: 'text', text: 'Marca' }),
      el({ id: 'l7', type: 'logo', zone: 'pecho', assetPublicId: 'logo-x' }),
      el({ id: 'l8', type: 'logo', zone: 'espalda', assetPublicId: 'logo-x' }),
    ],
    CUSTOMIZER_EMBROIDERY_PRICING_CENTS.TEXT +
      CUSTOMIZER_EMBROIDERY_PRICING_CENTS.CHEST_LOGO +
      CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_SAME_AS_CHEST,
  )

  runCase(
    'elemento oculto no cobra',
    [el({ id: 't3', type: 'text', text: 'Oculto', visible: false })],
    0,
  )

  runCase(
    'placeholder sin asset/text no cobra',
    [
      el({ id: 'l9', type: 'logo', zone: 'pecho', text: '[Logo]' }),
      el({ id: 't4', type: 'text', text: '' }),
    ],
    0,
  )

  console.log('\nAll customizer pricing checks passed.')
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
