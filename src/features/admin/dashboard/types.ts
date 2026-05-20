export type AdminDashboardMetrics = {
  salesTodayCents: number
  salesMonthCents: number
  pendingOrders: number
  designsCreated: number
  abandonedCarts: number
  averageOrderValueCents: number
  totalOrders: number
  totalCustomers: number
}

export type AdminRecentOrder = {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  totalCents: number
  createdAt: string
  itemCount: number
  hasCustomDesign: boolean
}

export type AdminProductionQueueItem = {
  id: string
  orderNumber: string
  customerName: string | null
  productNames: string[]
  customizationTypes: string[]
  status: string
  fulfillmentStatus: string
  estimatedDeliveryDate: string | null
  createdAt: string
}

export type AdminRecentDesign = {
  id: string
  name: string | null
  status: string
  previewUrl: string | null
  productName: string
  customerName: string | null
  customerEmail: string | null
  finalPriceCents: number
  updatedAt: string
}

export type AdminRecentPayment = {
  id: string
  orderNumber: string
  provider: string
  method: string
  status: string
  amountCents: number
  currency: string
  createdAt: string
  paidAt: string | null
}

export type AdminTopProduct = {
  productId: string
  productName: string
  productSlug: string
  orderCount: number
  quantitySold: number
  revenueCents: number
  customizedCount: number
}
