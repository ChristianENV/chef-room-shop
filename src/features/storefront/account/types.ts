/** Account user from BFF `meProfile`. */
export type AccountUser = {
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

export type AccountAddress = {
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

export type AccountOrderItem = {
  id: string
  name: string
  sku: string | null
  quantity: number
  unitPriceCents: number
  customizationPriceCents: number
  totalPriceCents: number
}

export type AccountOrder = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  totalCents: number
  currency: string
  placedAt: string | null
  createdAt: string
  items: AccountOrderItem[]
}

export type AccountDesign = {
  id: string
  name: string | null
  status: string
  previewUrl: string | null
  finalPriceCents: number
  currency: string
  createdAt: string
  updatedAt: string
  product: { id: string; slug: string; name: string; basePriceCents: number } | null
}

export type AccountDashboardSummary = {
  totalOrders: number
  activeOrders: number
  savedDesigns: number
  defaultShippingAddress: AccountAddress | null
  recentOrders: AccountOrder[]
  recentDesigns: AccountDesign[]
}

export type UpdateMyProfileInput = {
  firstName?: string
  lastName?: string
  phone?: string
  marketingOptIn?: boolean
}

export type MyAddressInput = {
  type: string
  firstName?: string
  lastName?: string
  phone?: string
  street: string
  extNumber?: string
  intNumber?: string
  neighborhood?: string
  city: string
  state: string
  country?: string
  postalCode: string
  references?: string
  isDefault?: boolean
}
