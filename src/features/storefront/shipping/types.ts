export type ShippingRate = {
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

export type ShippingQuote = {
  id: string
  provider: string
  providerQuoteId: string | null
  originPostalCode: string
  destinationPostalCode: string
  isCompleted: boolean
  expiresAt: string | null
  packageJson: unknown
  rates: ShippingRate[]
  createdAt: string
  updatedAt: string
}

export type ShippingQuotePayload = {
  quote: ShippingQuote
  recommendedRate: ShippingRate | null
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
