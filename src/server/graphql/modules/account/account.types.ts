import type { CatalogProductGql } from '../catalog/catalog.types'

/** GraphQL account user profile. */
export type AccountUserGql = {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  image: string | null
  marketingOptIn: boolean
  roles: string[]
  createdAt: string
}

/** GraphQL account address. */
export type AccountAddressGql = {
  id: string
  type: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  street: string
  extNumber: string | null
  intNumber: string | null
  neighborhood: string | null
  city: string
  state: string
  country: string
  postalCode: string
  references: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type AccountOrderItemGql = {
  id: string
  name: string
  sku: string | null
  quantity: number
  unitPriceCents: number
  customizationPriceCents: number
  totalPriceCents: number
  productSnapshotJson: unknown
  designSnapshotJson: unknown | null
  productionNotes: string | null
}

export type AccountOrderPaymentActionsGql = {
  canVerifyPayment: boolean
  canContinuePayment: boolean
  canRetryPayment: boolean
  paymentRedirectUrl: string | null
}

export type AccountPaymentStatusPayloadGql = {
  orderNumber: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string | null
  canRetryPayment: boolean
  canContinuePayment: boolean
  paymentRedirectUrl: string | null
  checkedAt: string
  message: string
}

export type AccountPaymentGql = {
  id: string
  provider: string
  method: string
  status: string
  amountCents: number
  currency: string
  paidAt: string | null
  expiresAt: string | null
}

export type AccountShipmentGql = {
  id: string
  carrier: string | null
  trackingNumber: string | null
  status: string
  shippedAt: string | null
  deliveredAt: string | null
}

export type AccountOrderEventGql = {
  id: string
  type: string
  message: string
  createdAt: string
}

export type AccountOrderGql = {
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
  placedAt: string | null
  createdAt: string
  items: AccountOrderItemGql[]
  payments: AccountPaymentGql[]
  shipments: AccountShipmentGql[]
  events: AccountOrderEventGql[]
  paymentActions: AccountOrderPaymentActionsGql
}

export type AccountDesignGql = {
  id: string
  name: string | null
  status: string
  previewUrl: string | null
  previewPublicId: string | null
  finalPriceCents: number
  currency: string
  configJson: unknown
  createdAt: string
  updatedAt: string
  purchasedAt: string | null
  product: CatalogProductGql | null
}

export type AccountDashboardSummaryGql = {
  totalOrders: number
  activeOrders: number
  savedDesigns: number
  defaultShippingAddress: AccountAddressGql | null
  recentOrders: AccountOrderGql[]
  recentDesigns: AccountDesignGql[]
}

export type UpdateMyProfileInput = {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  marketingOptIn?: boolean | null
}

export type MyAddressInput = {
  type: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  street: string
  extNumber?: string | null
  intNumber?: string | null
  neighborhood?: string | null
  city: string
  state: string
  country?: string | null
  postalCode: string
  references?: string | null
  isDefault?: boolean | null
}

export type PaginationInput = {
  limit?: number | null
  offset?: number | null
}

export type MyDesignsInput = PaginationInput & {
  status?: string | null
}
