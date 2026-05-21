import type { Prisma, ShippingQuote, ShippingRate } from '@prisma/client'

export type ShippingQuoteOwner = {
  userId: string | null
  guestSessionId: string | null
}

export type ShippingRateGql = {
  id: string
  providerRateId: string
  carrier: string
  service: string | null
  amountCents: number
  currency: string
  estimatedDays: number | null
  estimatedDeliveryDate: string | null
  expiresAt: string | null
  selectedAt: string | null
}

export type ShippingQuoteGql = {
  id: string
  provider: string
  providerQuoteId: string | null
  originPostalCode: string
  destinationPostalCode: string
  isCompleted: boolean
  expiresAt: string | null
  packageJson: Prisma.JsonValue
  rates: ShippingRateGql[]
  createdAt: string
  updatedAt: string
}

export type ShippingQuotePayloadGql = {
  quote: ShippingQuoteGql
  recommendedRate: ShippingRateGql | null
}

export type ShippingAddressQuoteInput = {
  postalCode: string
  city?: string | null
  state?: string | null
  country?: string | null
}

export type CreateShippingQuoteInput = {
  destination: ShippingAddressQuoteInput
}

export type ShippingQuoteWithRates = ShippingQuote & {
  rates: ShippingRate[]
}

export type CartForShippingQuote = {
  id: string
  items: Array<{ quantity: number }>
}
