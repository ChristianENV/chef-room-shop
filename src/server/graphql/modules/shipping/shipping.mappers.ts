import type { ShippingRate } from '@prisma/client'

import type {
  ShippingQuoteGql,
  ShippingQuotePayloadGql,
  ShippingQuoteWithRates,
  ShippingRateGql,
} from './shipping.types'

function toIso(value: Date | null | undefined): string | null {
  if (!value) return null
  return value.toISOString()
}

export function mapShippingRateToGql(rate: ShippingRate): ShippingRateGql {
  return {
    id: rate.id,
    providerRateId: rate.providerRateId,
    carrier: rate.carrier,
    service: rate.service,
    amountCents: rate.amountCents,
    currency: rate.currency,
    estimatedDays: rate.estimatedDays,
    estimatedDeliveryDate: toIso(rate.estimatedDeliveryDate),
    expiresAt: toIso(rate.expiresAt),
    selectedAt: toIso(rate.selectedAt),
  }
}

export function mapShippingQuoteToGql(quote: ShippingQuoteWithRates): ShippingQuoteGql {
  return {
    id: quote.id,
    provider: quote.provider,
    providerQuoteId: quote.providerQuoteId,
    originPostalCode: quote.originPostalCode,
    destinationPostalCode: quote.destinationPostalCode,
    isCompleted: quote.isCompleted,
    expiresAt: toIso(quote.expiresAt),
    packageJson: quote.packageJson,
    rates: quote.rates.map(mapShippingRateToGql),
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
  }
}

/**
 * Picks the recommended rate: selected rate if any; otherwise cheapest;
 * on tie, lowest estimatedDays (null treated as slowest).
 */
export function pickRecommendedRate(rates: ShippingRateGql[]): ShippingRateGql | null {
  if (rates.length === 0) return null

  const selected = rates.find((rate) => rate.selectedAt)
  if (selected) return selected

  return rates.reduce<ShippingRateGql | null>((best, rate) => {
    if (!best) return rate
    if (rate.amountCents < best.amountCents) return rate
    if (rate.amountCents > best.amountCents) return best

    const bestDays = best.estimatedDays ?? Number.MAX_SAFE_INTEGER
    const rateDays = rate.estimatedDays ?? Number.MAX_SAFE_INTEGER
    return rateDays < bestDays ? rate : best
  }, null)
}

export function toShippingQuotePayload(quote: ShippingQuoteWithRates): ShippingQuotePayloadGql {
  const gqlQuote = mapShippingQuoteToGql(quote)
  return {
    quote: gqlQuote,
    recommendedRate: pickRecommendedRate(gqlQuote.rates),
  }
}
