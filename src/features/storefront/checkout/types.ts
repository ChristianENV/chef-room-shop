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
  shippingRateId?: string | null
}

export type CheckoutOrderPayload = {
  orderNumber: string
  orderId: string
  status: string
  paymentStatus: string
  totalCents: number
  shippingCents: number
  currency: string
  claimUrl?: string | null
  accountOrderUrl?: string | null
}

export type CompleteCheckoutPayload = CheckoutOrderPayload & {
  paymentRedirectUrl: string
  paymentProviderOrderId: string | null
  paymentMethod: string
  successUrl: string
  returnToken: string
}

export type CheckoutResult = {
  orderNumber: string
  orderId: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  totalCents: number
  shippingCents: number
  subtotalCents: number
  customizationTotalCents?: number
  discountTotalCents?: number
  taxTotalCents?: number
  currency: string
  paymentMethod: string
  createdAt: string
  placedAt?: string | null
  maskedCustomerEmail: string
  items: PublicOrderItem[]
  payments: PublicOrderPayment[]
  shipments: CheckoutResultShipment[]
  events: CheckoutResultEvent[]
  paymentActions: CheckoutResultPaymentActions
  claimUrl?: string | null
  accountOrderUrl?: string | null
  canViewDetails: boolean
  viewerEmailMatchesOrder: boolean
  detailUrl?: string | null
  paymentReference?: string | null
  paymentExpiresAt?: string | null
  cashPaymentLocations?: string[] | null
  returnTokenValid: boolean
  tokenExpired: boolean
  loginUrl: string
  registerUrl: string
}

export type CheckoutResultShipment = {
  id: string
  carrier: string | null
  trackingNumber: string | null
  status: string
  shippedAt?: string | null
  deliveredAt?: string | null
}

export type CheckoutResultEvent = {
  id: string
  type: string
  message: string
  createdAt: string
}

export type CheckoutResultPaymentActions = {
  canVerifyPayment: boolean
  canContinuePayment: boolean
  canRetryPayment: boolean
  paymentRedirectUrl: string | null
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
  paidAt?: string | null
  expiresAt?: string | null
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

export type ClaimGuestOrderStatus =
  | 'CLAIMED'
  | 'ALREADY_CLAIMED_BY_USER'
  | 'EMAIL_VERIFICATION_REQUIRED'
  | 'EMAIL_MISMATCH'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'ORDER_ALREADY_CLAIMED'
  | 'UNAUTHENTICATED'

export type ClaimGuestOrderPayload = {
  success: boolean
  status: ClaimGuestOrderStatus
  orderNumber?: string | null
  message?: string | null
}

export type OrderClaimTransferStatus =
  | 'SENT'
  | 'ALREADY_PENDING'
  | 'ALREADY_CLAIMED_BY_USER'
  | 'ORDER_ALREADY_CLAIMED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'EMAIL_MATCHES_USE_DIRECT_CLAIM'
  | 'ERROR'

export type OrderClaimTransferPayload = {
  success: boolean
  status: OrderClaimTransferStatus
  message?: string | null
}
