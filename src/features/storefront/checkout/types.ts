export type CheckoutAddressInput = {
  firstName: string
  lastName: string
  phone: string
  street: string
  extNumber?: string | null
  intNumber?: string | null
  neighborhood?: string | null
  city: string
  state: string
  country: string
  postalCode: string
  references?: string | null
}

export type CreateCheckoutOrderInput = {
  email: string
  phone: string
  shippingAddress: CheckoutAddressInput
  billingAddress?: CheckoutAddressInput | null
  useSameBillingAddress?: boolean
  notes?: string | null
  paymentMethod: string
}

export type CheckoutOrderPayload = {
  orderNumber: string
  orderId: string
  status: string
  paymentStatus: string
  totalCents: number
  currency: string
  claimUrl?: string | null
  accountOrderUrl?: string | null
}

export type PublicOrderItem = {
  id: string
  name: string
  quantity: number
  totalPriceCents: number
  customizationPriceCents: number
  productSnapshotJson: unknown
  designSnapshotJson: unknown | null
}

export type PublicOrderPayment = {
  id: string
  provider: string
  method: string
  status: string
  amountCents: number
  currency: string
}

export type CreateConektaCheckoutInput = {
  orderNumber: string
  email?: string | null
}

export type ConektaCheckoutPayload = {
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

export type PublicOrder = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  customerEmail: string
  customerPhone: string | null
  currency: string
  subtotalCents: number
  customizationTotalCents: number
  shippingCostCents: number
  discountTotalCents: number
  taxTotalCents: number
  totalCents: number
  createdAt: string
  items: PublicOrderItem[]
  payments: PublicOrderPayment[]
}
