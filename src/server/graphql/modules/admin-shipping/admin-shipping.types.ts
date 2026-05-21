export type AdminShipmentEventGql = {
  id: string
  status: string
  message: string | null
  rawPayloadJson: Record<string, unknown> | null
  createdAt: string
}

export type AdminShipmentGql = {
  id: string
  orderNumber: string
  provider: string | null
  providerShipmentId: string | null
  providerLabelId: string | null
  carrier: string | null
  service: string | null
  trackingNumber: string | null
  status: string
  labelUrl: string | null
  labelFormat: string | null
  costCents: number | null
  currency: string
  shippedAt: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
  events: AdminShipmentEventGql[]
}

export type AdminCreateShippingLabelInput = {
  orderNumber: string
  rateId?: string | null
  labelFormat?: string | null
}

export type AdminCancelShippingLabelInput = {
  orderNumber: string
  reason?: string | null
}
