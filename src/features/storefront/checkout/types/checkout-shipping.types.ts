export type SelectedShippingRateSummary = {
  rateId: string
  quoteId: string
  carrier: string
  service: string | null
  amountCents: number
  estimatedDays: number | null
}
