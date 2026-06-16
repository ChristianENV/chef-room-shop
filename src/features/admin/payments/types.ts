export type AdminPayment = {
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

export type AdminPaymentsPayload = {
  items: AdminPayment[]
  total: number
}

export type AdminPaymentsFilter = {
  search?: string | null
  status?: string | null
}

export type AdminPaymentsListVariables = {
  filter?: AdminPaymentsFilter | null
  limit?: number | null
  offset?: number | null
}

export type AdminPaymentStatusFilter =
  | 'all'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'CANCELLED'

export type AdminPaymentsUiTableRow = {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  providerLabel: string
  methodLabel: string
  status: string
  statusLabel: string
  amountLabel: string
  currency: string
  providerPaymentIdMasked: string
  paymentDateLabel: string
  updatedAtLabel: string
}
