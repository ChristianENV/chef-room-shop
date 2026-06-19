import type { AddressType, Order, OrderItem, Payment, PaymentMethod } from '@prisma/client'

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
  /** Selected ShippingRate id from quote BFF — amount is read server-side from DB. */
  shippingRateId?: string | null
}

export type CheckoutOrderPayloadGql = {
  orderNumber: string
  orderId: string
  status: string
  paymentStatus: string
  totalCents: number
  shippingCents: number
  currency: string
  claimUrl: string | null
  accountOrderUrl: string | null
}

export type CompleteCheckoutPayloadGql = CheckoutOrderPayloadGql & {
  paymentRedirectUrl: string
  paymentProviderOrderId: string | null
  paymentMethod: string
  successUrl: string
  returnToken: string
}

export type CheckoutResultItemGql = PublicOrderItemGql

export type CheckoutResultGql = {
  orderNumber: string
  orderId: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  totalCents: number
  shippingCents: number
  subtotalCents: number
  customizationTotalCents: number
  discountTotalCents: number
  taxTotalCents: number
  currency: string
  paymentMethod: string
  createdAt: string
  placedAt: string | null
  maskedCustomerEmail: string
  items: CheckoutResultItemGql[]
  payments: PublicOrderPaymentGql[]
  shipments: Array<{
    id: string
    carrier: string | null
    trackingNumber: string | null
    status: string
    shippedAt: string | null
    deliveredAt: string | null
  }>
  events: Array<{
    id: string
    type: string
    message: string
    createdAt: string
  }>
  paymentActions: {
    canVerifyPayment: boolean
    canContinuePayment: boolean
    canRetryPayment: boolean
    paymentRedirectUrl: string | null
  }
  claimUrl: string | null
  accountOrderUrl: string | null
  canViewDetails: boolean
  viewerEmailMatchesOrder: boolean
  detailUrl: string | null
  paymentReference: string | null
  paymentExpiresAt: string | null
  cashPaymentLocations: string[] | null
  returnTokenValid: boolean
  tokenExpired: boolean
  loginUrl: string
  registerUrl: string
}

export type PublicOrderItemGql = {
  id: string
  name: string
  quantity: number
  totalPriceCents: number
  customizationPriceCents: number
  productSnapshotJson: unknown
  designSnapshotJson: unknown | null
}

export type PublicOrderPaymentGql = {
  id: string
  provider: string
  method: string
  status: string
  amountCents: number
  currency: string
  paidAt: string | null
  expiresAt: string | null
}

export type PublicOrderGql = {
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
  items: PublicOrderItemGql[]
  payments: PublicOrderPaymentGql[]
}

export type CheckoutOwner = {
  userId: string | null
  guestSessionId: string | null
}

export type OrderWithCheckoutRelations = Order & {
  items: OrderItem[]
  payments: Payment[]
}

export type CheckoutPaymentMethod = PaymentMethod

export type CheckoutAddressType = AddressType
