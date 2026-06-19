export type AdminShipmentByOrderNumberPayload = {
  shipment: AdminShipment | null
  isSkydropxMockMode: boolean
}

export type AdminShipmentEvent = {
  id: string
  status: string
  message: string | null
  rawPayloadJson: Record<string, unknown> | null
  createdAt: string
}

export type AdminShipment = {
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
  events: AdminShipmentEvent[]
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

export type AdminSimulateMockShipmentTrackingInput = {
  orderNumber: string
  trackingStatus:
    | 'created'
    | 'label_generated'
    | 'in_transit'
    | 'delivered'
    | 'exception'
}

export type MockTrackingStatus = AdminSimulateMockShipmentTrackingInput['trackingStatus']

export type AdminShipmentListItem = {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string
  status: string
  carrier: string | null
  trackingNumber: string | null
  labelStatus: string
  costCents: number | null
  currency: string
  createdAt: string
  updatedAt: string
  trackingUpdatedAt: string | null
}

export type AdminShipmentsPayload = {
  items: AdminShipmentListItem[]
  total: number
}

export type AdminShipmentsFilter = {
  search?: string | null
  status?: string | null
}

export type AdminShipmentsListVariables = {
  filter?: AdminShipmentsFilter | null
  limit?: number | null
  offset?: number | null
}

export type AdminShipmentStatusFilter =
  | 'all'
  | 'PENDING'
  | 'LABEL_CREATED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED'

export type AdminShipmentsUiTableRow = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  status: string
  statusLabel: string
  carrier: string
  trackingNumber: string
  labelStatus: string
  costLabel: string
  currency: string
  createdAtLabel: string
  trackingUpdatedAtLabel: string
}
