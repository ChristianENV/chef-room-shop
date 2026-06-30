import type { CartCommercialOptionSnapshot } from '@/src/features/storefront/cart/types/cart-bff.types'

/** UI filter slug for order status (cards / toolbar). */
export type AdminOrderStatusFilter =
  | 'pendiente-pago'
  | 'pagado'
  | 'en-produccion'
  | 'listo-envio'
  | 'enviado'
  | 'entregado'
  | 'cancelado'

/** UI filter slug for payment status. */
export type AdminPaymentStatusFilter = 'pendiente' | 'completado' | 'fallido' | 'reembolsado'

export type StatusBadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export type AdminOrdersUiAddress = {
  id: string
  label: string
  firstName: string
  lastName: string
  street: string
  exteriorNumber: string
  interiorNumber?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}

export type AdminOrdersUiCustomizationElement = {
  id: string
  type: string
  name?: string
  text?: string
  zone?: string
  assetUrl?: string
}

export type AdminOrdersUiCustomizationArea = {
  areaId: string
  areaName: string
  type: string
  text?: string
  logoUrl?: string
  font?: string
  color?: string
  width: number
  height: number
  price: number
}

export type AdminOrdersUiCustomization = {
  designId: string
  previewUrl: string
  previewBackUrl?: string
  size: string
  fabricColor: string
  fabricColorHex?: string
  detailColor: string
  detailColorHex?: string
  customizationPrice: number
  elements: AdminOrdersUiCustomizationElement[]
  areas: AdminOrdersUiCustomizationArea[]
  productionNotes?: string
  summaryLines?: string[]
  rawSnapshots?: {
    productSnapshotJson: unknown
    designSnapshotJson: unknown
    designId: string | null
  }
}

export type AdminOrdersUiItem = {
  id: string
  productId: string
  productName: string
  productImage: string
  sku: string
  color: string
  colorHex: string
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
  customizationPrice: number
  optionPriceCents: number
  commercialOptionsSnapshot: CartCommercialOptionSnapshot[]
  hasCustomization: boolean
  customization?: AdminOrdersUiCustomization
}

export type AdminOrdersUiTimelineEvent = {
  id: string
  event: string
  status: AdminOrderStatusFilter
  timestamp: string
  user?: string
  notes?: string
}

export type AdminOrdersUiCustomer = {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  customerSince: string
}

export type AdminOrdersUiOrder = {
  id: string
  orderNumber: string
  createdAt: string
  updatedAt: string
  status: AdminOrderStatusFilter
  statusLabel: string
  paymentStatus: AdminPaymentStatusFilter
  paymentStatusLabel: string
  productionStatus: string
  productionStatusLabel: string
  fulfillmentStatus: string
  fulfillmentStatusLabel: string
  customer: AdminOrdersUiCustomer
  shippingAddress: AdminOrdersUiAddress
  billingAddress?: AdminOrdersUiAddress
  items: AdminOrdersUiItem[]
  subtotal: number
  shipping: number
  discount: number
  tax: number
  customizationTotal: number
  optionTotal: number
  total: number
  paymentMethod?: string
  paymentReference?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
  notes?: string
  timeline: AdminOrdersUiTimelineEvent[]
  canMoveToProduction: boolean
  canMarkReadyToShip: boolean
  canAddTracking: boolean
  canCancel: boolean
}

export type AdminOrdersUiTableRow = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  itemCount: number
  hasCustomization: boolean
  paymentStatus: AdminPaymentStatusFilter
  paymentStatusLabel: string
  status: AdminOrderStatusFilter
  statusLabel: string
  statusBadgeVariant: StatusBadgeVariant
  productionStatusLabel: string
  total: number
  totalFormatted: string
  createdAt: string
  createdAtFormatted: string
  order: AdminOrdersUiOrder
}

export type AdminOrdersStatusCardCounts = Record<AdminOrderStatusFilter, number> & {
  cancelado: number
}

export type AdminOrdersProductionSheetUi = {
  orderNumber: string
  customerName: string
  customerEmail: string
  notes: string | null
  generatedAt: string
  generatedAtFormatted: string
  items: AdminOrdersUiItem[]
}
