export type AdminOrderCustomer = {
  userId: string | null
  name: string | null
  email: string
  phone: string | null
}

export type AdminOrderAddress = {
  id: string
  type: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  line1: string
  line2: string | null
  label: string | null
  city: string
  state: string
  country: string
  postalCode: string
}

export type AdminOrderItem = {
  id: string
  productId: string | null
  productVariantId: string | null
  designId: string | null
  name: string
  sku: string | null
  quantity: number
  unitPriceCents: number
  customizationPriceCents: number
  lineTotalCents: number
  productSnapshotJson: unknown
  designSnapshotJson: unknown | null
  productionNotes: string | null
  hasCustomDesign: boolean
}

export type AdminOrderPayment = {
  id: string
  provider: string
  providerOrderId: string | null
  method: string
  status: string
  amountCents: number
  currency: string
  paidAt: string | null
  expiresAt: string | null
  createdAt: string
}

export type AdminOrderShipment = {
  id: string
  carrier: string | null
  trackingNumber: string | null
  status: string
  shippedAt: string | null
  deliveredAt: string | null
  createdAt: string
}

export type AdminOrderEvent = {
  id: string
  type: string
  message: string | null
  createdAt: string
  actorName: string | null
}

export type AdminOrder = {
  id: string
  orderNumber: string
  customer: AdminOrderCustomer
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  currency: string
  subtotalCents: number
  customizationTotalCents: number
  shippingCents: number
  discountCents: number
  taxCents: number
  totalCents: number
  notes: string | null
  placedAt: string | null
  createdAt: string
  updatedAt: string
  shippingAddress: AdminOrderAddress | null
  billingAddress: AdminOrderAddress | null
  items: AdminOrderItem[]
  payments: AdminOrderPayment[]
  shipments: AdminOrderShipment[]
  events: AdminOrderEvent[]
  hasCustomDesign: boolean
}

export type AdminOrdersPayload = {
  items: AdminOrder[]
  total: number
}

export type AdminOrderStatusSummary = {
  pendingPayment: number
  paid: number
  inProduction: number
  readyToShip: number
  shipped: number
  delivered: number
  cancelled: number
}

export type AdminProductionSheet = {
  orderNumber: string
  customerName: string | null
  customerEmail: string
  items: AdminOrderItem[]
  notes: string | null
  generatedAt: string
}

export type AdminOrdersFilterInput = {
  search?: string | null
  status?: string | null
  paymentStatus?: string | null
  fulfillmentStatus?: string | null
  productionOnly?: boolean | null
  hasCustomDesign?: boolean | null
  dateFrom?: string | null
  dateTo?: string | null
}

export type AdminOrdersSortInput = {
  field?: string | null
  direction?: string | null
}

export type AdminOrdersListVariables = {
  filter?: AdminOrdersFilterInput | null
  sort?: AdminOrdersSortInput | null
  limit?: number | null
  offset?: number | null
}

export type UpdateAdminOrderStatusInput = {
  orderNumber: string
  status: string
  message?: string | null
}

export type AddAdminOrderTrackingInput = {
  orderNumber: string
  carrier: string
  trackingNumber: string
  status?: string | null
  shippedAt?: string | null
}

export type AddAdminOrderNoteInput = {
  orderNumber: string
  note: string
}
