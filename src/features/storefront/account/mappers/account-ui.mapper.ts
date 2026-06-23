import type {
  Address,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  ProductCategory,
  SavedDesign,
  SavedDesignStatus,
  UserProfile,
} from '@/lib/types'
import { centsToPesos } from '@/src/lib/formatters'
import { mapCustomerTierToUiStatus } from '@/src/lib/customer/customer-tier'
import { extractSelectionFromConfigJson } from '@/src/lib/customization/build-customization-snapshot'
import { resolveDesignPreviewUrl } from '../lib/design-preview.utils'
import type {
  AccountAddress,
  AccountDashboardSummary,
  AccountDesign,
  AccountOrder,
  AccountOrderItem,
  AccountUser,
  MyAddressInput,
} from '../types'

/** UI address with BFF type for mutations. */
export type UiAddress = Address & {
  addressType: string
}

type DesignConfig = {
  garment?: { baseColor?: string }
  layers?: Array<{ type?: string }>
}

function parseString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  PENDING_PAYMENT: 'pendiente',
  PAYMENT_FAILED: 'pendiente',
  PAID: 'pagado',
  IN_PRODUCTION: 'en-produccion',
  READY_TO_SHIP: 'en-produccion',
  SHIPPED: 'enviado',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
  REFUNDED: 'cancelado',
}

const DESIGN_STATUS_MAP: Record<string, SavedDesignStatus> = {
  DRAFT: 'borrador',
  SAVED: 'borrador',
  IN_CART: 'en-carrito',
  PURCHASED: 'comprado',
  ABANDONED: 'borrador',
  ARCHIVED: 'borrador',
}

/**
 * Maps BFF account user to legacy UserProfile UI shape.
 */
export function mapAccountUserToProfile(user: AccountUser): UserProfile {
  return {
    id: user.id,
    firstName: user.firstName ?? user.name?.split(' ')[0] ?? 'Cliente',
    lastName: user.lastName ?? user.name?.split(' ').slice(1).join(' ') ?? '',
    email: user.email,
    phone: user.phone ?? '',
    avatar: user.image ?? undefined,
    createdAt: user.createdAt,
    customerStatus: mapCustomerTierToUiStatus(user.customerTier),
  }
}

/**
 * Maps BFF address to legacy Address UI shape.
 */
export function mapAccountAddressToUi(address: AccountAddress): UiAddress {
  const isShipping = address.isDefault && (address.type === 'SHIPPING' || address.type === 'BOTH')
  const isBilling = address.isDefault && (address.type === 'BILLING' || address.type === 'BOTH')

  return {
    id: address.id,
    label: address.neighborhood ?? address.references ?? 'Dirección',
    firstName: address.firstName ?? '',
    lastName: address.lastName ?? '',
    street: address.street,
    exteriorNumber: address.extNumber ?? '',
    interiorNumber: address.intNumber ?? undefined,
    neighborhood: address.neighborhood ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country === 'MX' ? 'Mexico' : address.country,
    phone: address.phone ?? '',
    isDefaultShipping: isShipping,
    isDefaultBilling: isBilling,
    addressType: address.type,
  }
}

function mapOrderItemToUi(item: AccountOrderItem): OrderItem {
  return {
    id: item.id,
    productId: item.sku ?? item.id,
    productName: item.name,
    productImage: '',
    color: '—',
    size: '—',
    quantity: item.quantity,
    price: centsToPesos(item.totalPriceCents / Math.max(item.quantity, 1)),
    hasCustomization: item.customizationPriceCents > 0,
    customizationDetails: item.customizationPriceCents > 0 ? 'Personalización' : undefined,
  }
}

function mapOrderStatus(status: string): OrderStatus {
  return ORDER_STATUS_MAP[status] ?? 'pendiente'
}

function mapPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case 'PAID':
      return 'completado'
    case 'FAILED':
      return 'fallido'
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'reembolsado'
    default:
      return 'pendiente'
  }
}

/**
 * Maps BFF order to legacy Order UI shape.
 */
export function mapAccountOrderToUi(
  order: AccountOrder & {
    items: AccountOrderItem[]
    shipments?: Array<{
      carrier: string | null
      trackingNumber: string | null
      status: string
      deliveredAt?: string | null
    }>
    payments?: Array<{ status: string }>
    subtotalCents?: number
    shippingCostCents?: number
    discountTotalCents?: number
  },
): Order {
  const date = order.placedAt ?? order.createdAt
  const shipment = order.shipments?.[0]
  const trackingNumber = shipment?.trackingNumber ?? undefined

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    date,
    status: mapOrderStatus(order.status),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    items: order.items.map(mapOrderItemToUi),
    subtotal: centsToPesos(order.subtotalCents ?? order.totalCents),
    shipping: centsToPesos(order.shippingCostCents ?? 0),
    discount: centsToPesos(order.discountTotalCents ?? 0),
    total: centsToPesos(order.totalCents),
    shippingAddress: {
      id: 'shipping',
      label: 'Envío',
      firstName: '',
      lastName: '',
      street: '',
      exteriorNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Mexico',
      phone: '',
      isDefaultShipping: true,
      isDefaultBilling: false,
    },
    trackingNumber,
    trackingUrl: trackingNumber
      ? `https://www.google.com/search?q=${encodeURIComponent(trackingNumber)}`
      : undefined,
    estimatedDelivery: shipment?.deliveredAt ?? undefined,
  }
}

function mapDesignStatus(status: string): SavedDesignStatus {
  return DESIGN_STATUS_MAP[status] ?? 'borrador'
}

function inferProductCategory(design: AccountDesign): ProductCategory {
  const slug = design.product?.slug ?? ''
  if (slug.includes('pantalon') || slug.includes('pants')) return 'pantalones'
  if (slug.includes('mandil') || slug.includes('apron')) return 'mandiles'
  return 'filipinas'
}

/**
 * Maps BFF design to legacy SavedDesign UI shape.
 */
export function mapAccountDesignToUi(design: AccountDesign): SavedDesign {
  const selection = extractSelectionFromConfigJson(design.configJson)
  const legacyConfig = design.configJson as DesignConfig | undefined
  const fabricHex =
    selection.fabricColor.hex ??
    selection.selectedColor.hex ??
    legacyConfig?.garment?.baseColor ??
    '#FFFFFF'
  const fabricName = selection.fabricColor.name ?? selection.selectedColor.name ?? 'Personalizado'
  const previewUrl = resolveDesignPreviewUrl(design)
  const hasLogo = selection.elements.some((element) => element.type === 'logo')
  const textElement = selection.elements.find((element) => element.type === 'text')
  const embroideryText = parseString(textElement?.text)

  return {
    id: design.id,
    name: design.name ?? 'Diseño sin nombre',
    productType: inferProductCategory(design),
    productName: design.product?.name ?? 'Producto',
    productSlug: design.product?.slug,
    previewImage: previewUrl ?? '',
    lastEdited: design.updatedAt,
    estimatedPrice: centsToPesos(design.finalPriceCents),
    status: mapDesignStatus(design.status),
    customization: {
      color: fabricHex,
      embroideryType: hasLogo ? 'Logo' : legacyConfig?.layers?.[0]?.type,
      embroideryText: embroideryText ?? undefined,
    },
    fabricName,
  }
}

/**
 * Maps dashboard summary recent orders (minimal) to Order UI shape.
 */
export function mapSummaryOrderToUi(order: AccountDashboardSummary['recentOrders'][0]): Order {
  return {
    id: order.orderNumber,
    orderNumber: order.orderNumber,
    date: order.placedAt ?? new Date().toISOString(),
    status: mapOrderStatus(order.status),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    items: [],
    subtotal: centsToPesos(order.totalCents),
    shipping: 0,
    discount: 0,
    total: centsToPesos(order.totalCents),
    shippingAddress: {
      id: 'placeholder',
      label: '',
      firstName: '',
      lastName: '',
      street: '',
      exteriorNumber: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Mexico',
      phone: '',
      isDefaultShipping: false,
      isDefaultBilling: false,
    },
  }
}

/**
 * Maps legacy address form data to BFF address input.
 */
export function mapUiAddressToInput(partial: Partial<Address>): MyAddressInput {
  const ui = partial as Partial<UiAddress>
  let type = 'SHIPPING'
  if (ui.isDefaultBilling && ui.isDefaultShipping) {
    type = 'BOTH'
  } else if (ui.isDefaultBilling) {
    type = 'BILLING'
  } else if (ui.addressType) {
    type = ui.addressType
  }

  return {
    type,
    firstName: partial.firstName,
    lastName: partial.lastName,
    phone: partial.phone,
    street: partial.street ?? '',
    extNumber: partial.exteriorNumber,
    intNumber: partial.interiorNumber,
    neighborhood: partial.neighborhood,
    city: partial.city ?? '',
    state: partial.state ?? '',
    country: partial.country === 'Mexico' ? 'MX' : (partial.country ?? 'MX'),
    postalCode: partial.postalCode ?? '',
    references: partial.label,
    isDefault: !!(partial.isDefaultShipping || partial.isDefaultBilling),
  }
}

/**
 * Maps BFF address type for setDefaultAddress mutation.
 */
export function mapUiDefaultTypeToBff(type: 'shipping' | 'billing'): string {
  return type === 'billing' ? 'BILLING' : 'SHIPPING'
}
