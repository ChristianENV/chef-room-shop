export type AdminPaymentGql = {
  id: string
  orderId: string
  orderNumber: string
  customerName: string | null
  customerEmail: string
  provider: string
  method: string
  status: string
  amountCents: number
  currency: string
  providerPaymentIdMasked: string
  paidAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminPaymentsPayloadGql = {
  items: AdminPaymentGql[]
  total: number
}

export type AdminPaymentsFilterInput = {
  search?: string | null
  status?: string | null
}

export type AdminPaymentsListInput = {
  filter?: AdminPaymentsFilterInput | null
  limit?: number | null
  offset?: number | null
}
