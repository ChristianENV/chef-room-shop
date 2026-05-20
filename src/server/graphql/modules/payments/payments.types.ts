export type CreateConektaCheckoutInput = {
  orderNumber: string
  email?: string | null
}

export type ConektaCheckoutPayloadGql = {
  orderId: string
  orderNumber: string
  paymentId: string
  providerOrderId: string | null
  checkoutId: string | null
  checkoutUrl: string | null
  status: string
  amountCents: number
  currency: string
}

export type OrderWithPaymentsAndItems = {
  id: string
  orderNumber: string
  userId: string | null
  guestSessionId: string | null
  status: string
  customerEmail: string
  customerPhone: string | null
  totalCents: number
  shippingCents: number
  currency: string
  items: Array<{
    id: string
    quantity: number
    unitPriceCents: number
    customizationPriceCents: number
    productSnapshotJson: unknown
  }>
  payments: Array<{
    id: string
    providerOrderId: string
    status: string
    amountCents: number
    currency: string
    method: string | null
    attempts: Array<{
      id: string
      rawResponseJson: unknown
    }>
  }>
}
