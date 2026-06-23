import type { ShippingRate } from '../types'

export type ShippingRateBadge = 'recommended' | 'cheapest' | 'fastest' | 'selected'

export type ShippingRateViewMode = 'highlights' | 'all' | 'cheapest' | 'fastest' | 'carrier'

export type ShippingRateHighlightContext = {
  rate: ShippingRate
  badges: ShippingRateBadge[]
}

export type ShippingRateHighlightsResult = {
  cards: ShippingRateHighlightContext[]
  recommended: ShippingRate | null
  cheapest: ShippingRate | null
  fastest: ShippingRate | null
}

function rateDedupeKey(rate: ShippingRate): string {
  const providerId = rate.providerRateId?.trim()
  if (providerId) {
    return `provider:${providerId}`
  }
  return [
    'fallback',
    rate.carrier,
    rate.service ?? '',
    String(rate.amountCents),
    rate.estimatedDays == null ? 'null' : String(rate.estimatedDays),
  ].join('|')
}

function shouldPreferRate(
  current: ShippingRate,
  candidate: ShippingRate,
  recommendedRate: ShippingRate | null,
): boolean {
  if (candidate.selectedAt && !current.selectedAt) return true
  if (current.selectedAt && !candidate.selectedAt) return false
  if (recommendedRate?.id === candidate.id && recommendedRate.id !== current.id) {
    return true
  }
  return false
}

/**
 * Removes duplicate Skydropx rates; keeps selected or BFF-recommended when colliding.
 */
export function dedupeShippingRates(
  rates: ShippingRate[],
  recommendedRate: ShippingRate | null = null,
): ShippingRate[] {
  const byKey = new Map<string, ShippingRate>()

  for (const rate of rates) {
    const key = rateDedupeKey(rate)
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, rate)
      continue
    }
    if (shouldPreferRate(existing, rate, recommendedRate)) {
      byKey.set(key, rate)
    }
  }

  return Array.from(byKey.values())
}

function compareCheapest(a: ShippingRate, b: ShippingRate): number {
  if (a.amountCents !== b.amountCents) {
    return a.amountCents - b.amountCents
  }
  const daysA = a.estimatedDays ?? Number.MAX_SAFE_INTEGER
  const daysB = b.estimatedDays ?? Number.MAX_SAFE_INTEGER
  return daysA - daysB
}

function compareFastest(a: ShippingRate, b: ShippingRate): number {
  const daysA = a.estimatedDays ?? Number.MAX_SAFE_INTEGER
  const daysB = b.estimatedDays ?? Number.MAX_SAFE_INTEGER
  if (daysA !== daysB) {
    return daysA - daysB
  }
  return a.amountCents - b.amountCents
}

export function getCheapestShippingRate(rates: ShippingRate[]): ShippingRate | null {
  if (rates.length === 0) return null
  return [...rates].sort(compareCheapest)[0] ?? null
}

export function getFastestShippingRate(rates: ShippingRate[]): ShippingRate | null {
  const withDays = rates.filter((r) => r.estimatedDays != null)
  if (withDays.length === 0) return null
  return [...withDays].sort(compareFastest)[0] ?? null
}

function computeBalancedRecommended(rates: ShippingRate[]): ShippingRate | null {
  if (rates.length === 0) return null
  if (rates.length === 1) return rates[0] ?? null

  const prices = rates.map((r) => r.amountCents)
  const days = rates.map((r) => r.estimatedDays ?? 7)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const minDays = Math.min(...days)
  const maxDays = Math.max(...days)
  const priceSpan = maxPrice - minPrice || 1
  const daysSpan = maxDays - minDays || 1

  let best = rates[0]
  let bestScore = Number.POSITIVE_INFINITY

  for (const rate of rates) {
    const normalizedPrice = (rate.amountCents - minPrice) / priceSpan
    const normalizedDays = ((rate.estimatedDays ?? maxDays) - minDays) / daysSpan
    const score = normalizedPrice * 0.65 + normalizedDays * 0.35
    if (score < bestScore) {
      bestScore = score
      best = rate
    }
  }

  return best ?? null
}

export function getRecommendedShippingRate(
  rates: ShippingRate[],
  recommendedRate: ShippingRate | null,
): ShippingRate | null {
  if (rates.length === 0) return null
  if (recommendedRate) {
    const match = rates.find((r) => r.id === recommendedRate.id)
    if (match) return match
    const byProvider = recommendedRate.providerRateId
      ? rates.find((r) => r.providerRateId === recommendedRate.providerRateId)
      : undefined
    if (byProvider) return byProvider
  }
  return computeBalancedRecommended(rates)
}

function balancedSortScore(rate: ShippingRate, rates: ShippingRate[]): number {
  const prices = rates.map((r) => r.amountCents)
  const days = rates.map((r) => r.estimatedDays ?? 7)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const minDays = Math.min(...days)
  const maxDays = Math.max(...days)
  const priceSpan = maxPrice - minPrice || 1
  const daysSpan = maxDays - minDays || 1
  const normalizedPrice = (rate.amountCents - minPrice) / priceSpan
  const normalizedDays = ((rate.estimatedDays ?? maxDays) - minDays) / daysSpan
  return normalizedPrice * 0.65 + normalizedDays * 0.35
}

export function sortShippingRates(
  rates: ShippingRate[],
  mode: ShippingRateViewMode,
): ShippingRate[] {
  const copy = [...rates]
  switch (mode) {
    case 'cheapest':
      return copy.sort(compareCheapest)
    case 'fastest':
      return copy.sort(compareFastest)
    case 'carrier':
      return copy.sort((a, b) => {
        const carrier = a.carrier.localeCompare(b.carrier, 'es')
        if (carrier !== 0) return carrier
        return compareCheapest(a, b)
      })
    case 'all':
    case 'highlights':
    default:
      return copy.sort((a, b) => balancedSortScore(a, rates) - balancedSortScore(b, rates))
  }
}

export type ShippingRateBadgeContext = {
  recommendedId: string | null
  cheapestId: string | null
  fastestId: string | null
  selectedId: string | null
}

export function getShippingRateBadges(
  rate: ShippingRate,
  context: ShippingRateBadgeContext,
): ShippingRateBadge[] {
  const badges: ShippingRateBadge[] = []
  if (context.recommendedId === rate.id) badges.push('recommended')
  if (context.cheapestId === rate.id) badges.push('cheapest')
  if (context.fastestId === rate.id) badges.push('fastest')
  if (context.selectedId === rate.id || rate.selectedAt) badges.push('selected')
  return badges
}

function mergeHighlightCards(
  recommended: ShippingRate | null,
  cheapest: ShippingRate | null,
  fastest: ShippingRate | null,
  context: ShippingRateBadgeContext,
): ShippingRateHighlightContext[] {
  const byId = new Map<string, ShippingRate>()

  for (const rate of [recommended, cheapest, fastest]) {
    if (rate) byId.set(rate.id, rate)
  }

  const order = [recommended?.id, cheapest?.id, fastest?.id].filter(
    (id, index, arr): id is string => Boolean(id) && arr.indexOf(id) === index,
  )

  const cards: ShippingRateHighlightContext[] = []
  for (const id of order) {
    const rate = byId.get(id)
    if (!rate) continue
    cards.push({
      rate,
      badges: getShippingRateBadges(rate, context),
    })
  }

  return cards.slice(0, 3)
}

export function buildShippingRateHighlights(
  rates: ShippingRate[],
  recommendedRate: ShippingRate | null,
  selectedId: string | null = null,
): ShippingRateHighlightsResult {
  const deduped = dedupeShippingRates(rates, recommendedRate)
  const recommended = getRecommendedShippingRate(deduped, recommendedRate)
  const cheapest = getCheapestShippingRate(deduped)
  const fastest = getFastestShippingRate(deduped)

  const context: ShippingRateBadgeContext = {
    recommendedId: recommended?.id ?? null,
    cheapestId: cheapest?.id ?? null,
    fastestId: fastest?.id ?? null,
    selectedId,
  }

  const cards = mergeHighlightCards(recommended, cheapest, fastest, context)

  return {
    cards,
    recommended,
    cheapest,
    fastest,
  }
}

export function buildOtherShippingRates(
  rates: ShippingRate[],
  highlightedRates: ShippingRate[],
  recommendedRate: ShippingRate | null = null,
): ShippingRate[] {
  const deduped = dedupeShippingRates(rates, recommendedRate)
  const highlightIds = new Set(highlightedRates.map((r) => r.id))
  return deduped.filter((r) => !highlightIds.has(r.id))
}

export function formatShippingEstimatedDays(days: number | null): string {
  if (days == null) return 'Entrega estimada no disponible'
  if (days <= 1) return 'Llega en 1 día'
  return `Llega en ${days} días`
}

export function capitalizeCarrierName(carrier: string): string {
  const trimmed = carrier.trim()
  if (!trimmed) return carrier
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatQuoteExpiresAt(expiresAt: string | null): string | null {
  if (!expiresAt) return null
  try {
    const date = new Date(expiresAt)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return null
  }
}

const OTHER_RATES_PREVIEW_COUNT = 3
const OTHER_RATES_PAGE_SIZE = 8

export function paginateOtherRates(
  rates: ShippingRate[],
  visibleCount: number,
): {
  visible: ShippingRate[]
  hasMore: boolean
  remaining: number
} {
  const visible = rates.slice(0, visibleCount)
  const hasMore = rates.length > visibleCount
  return {
    visible,
    hasMore,
    remaining: Math.max(0, rates.length - visibleCount),
  }
}

export { OTHER_RATES_PAGE_SIZE, OTHER_RATES_PREVIEW_COUNT }
