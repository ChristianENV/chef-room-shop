import {
  type Address,
  type Design,
  type Order,
  type OrderEvent,
  type OrderItem,
  type Payment,
  type PaymentAttempt,
  type Shipment,
  type User,
  DesignStatus,
  PaymentMethod,
} from '@prisma/client'

import { mapProductToGql } from '../catalog/catalog.mappers'
import type { CatalogProductGql } from '../catalog/catalog.types'
import { getCashPaymentDetailsFromAttempts } from '../payments/payments.mappers'
import { resolveAccountPaymentActions } from './account-payment-actions'
import type {
  AccountAddressGql,
  AccountDesignGql,
  AccountOrderEventGql,
  AccountOrderGql,
  AccountOrderItemGql,
  AccountPaymentGql,
  AccountShipmentGql,
  AccountUserGql,
} from './account.types'

type UserWithRoles = User & {
  roles: { role: { slug: string } }[]
}

type OrderWithRelations = Order & {
  items: OrderItem[]
  payments: Array<Payment & { attempts?: PaymentAttempt[] }>
  shipments: Shipment[]
  events: OrderEvent[]
}

type ProductSnapshot = {
  slug?: string
  name?: string
  sku?: string
  basePriceCents?: number
}

type DesignConfig = {
  productSlug?: string
  finalPriceCents?: number
  currency?: string
}

function toIso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

function splitFullName(fullName: string): { firstName: string | null; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return { firstName: null, lastName: null }
  if (parts.length === 1) return { firstName: parts[0], lastName: null }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function parseLine2(line2: string | null | undefined): {
  extNumber: string | null
  intNumber: string | null
} {
  if (!line2?.trim()) return { extNumber: null, intNumber: null }
  const parts = line2.split('|').map((p) => p.trim())
  return {
    extNumber: parts[0] || null,
    intNumber: parts[1] || null,
  }
}

function buildLine2(extNumber?: string | null, intNumber?: string | null): string | null {
  const parts = [extNumber?.trim(), intNumber?.trim()].filter(Boolean)
  return parts.length > 0 ? parts.join(' | ') : null
}

/**
 * Builds Prisma address fields from validated GraphQL address input.
 */
export function mapAddressInputToPrisma(input: {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  street: string
  extNumber?: string | null
  intNumber?: string | null
  neighborhood?: string | null
  city: string
  state: string
  country: string
  postalCode: string
  references?: string | null
}) {
  const fullName =
    [input.firstName, input.lastName].filter(Boolean).join(' ').trim() || 'Cliente'

  return {
    fullName,
    line1: input.street.trim(),
    line2: buildLine2(input.extNumber, input.intNumber),
    label: input.neighborhood?.trim() || input.references?.trim() || null,
    city: input.city.trim(),
    state: input.state.trim(),
    country: input.country,
    postalCode: input.postalCode.trim(),
    phone: input.phone?.trim() || null,
  }
}

/**
 * Maps a Prisma user to the account GraphQL profile type.
 */
export function mapUserToAccountUser(user: UserWithRoles): AccountUserGql {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    image: user.image,
    marketingOptIn: user.marketingOptIn,
    customerTier: user.customerTier,
    roles: user.roles.map((r) => r.role.slug),
    createdAt: user.createdAt.toISOString(),
  }
}

/**
 * Maps a Prisma address to the account GraphQL address type.
 */
export function mapAddressToGql(address: Address): AccountAddressGql {
  const { firstName, lastName } = splitFullName(address.fullName)
  const { extNumber, intNumber } = parseLine2(address.line2)

  return {
    id: address.id,
    type: address.type,
    firstName,
    lastName,
    phone: address.phone,
    street: address.line1,
    extNumber,
    intNumber,
    neighborhood: address.label,
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode,
    references: address.label,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  }
}

function mapOrderItemToGql(item: OrderItem): AccountOrderItemGql {
  const snapshot = parseJsonRecord(item.productSnapshotJson) as ProductSnapshot

  return {
    id: item.id,
    name: snapshot.name ?? 'Producto',
    sku: snapshot.sku ?? snapshot.slug ?? null,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    customizationPriceCents: item.customizationPriceCents,
    totalPriceCents: item.lineTotalCents,
    productSnapshotJson: item.productSnapshotJson,
    designSnapshotJson: item.designSnapshotJson,
    productionNotes: null,
  }
}

function derivePaymentStatus(order: OrderWithRelations): string {
  const latest = order.payments[0]
  if (latest) return latest.status
  return order.status
}

function mapPaymentToGql(
  payment: Payment & { attempts?: PaymentAttempt[] },
): AccountPaymentGql {
  const cashDetails = getCashPaymentDetailsFromAttempts(payment.attempts ?? [])

  return {
    id: payment.id,
    provider: payment.provider,
    method: payment.method ?? PaymentMethod.OTHER,
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
    paidAt: toIso(payment.paidAt),
    expiresAt: cashDetails?.expiresAt ?? null,
  }
}

function mapShipmentToGql(shipment: Shipment): AccountShipmentGql {
  return {
    id: shipment.id,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    shippedAt: toIso(shipment.shippedAt),
    deliveredAt: toIso(shipment.deliveredAt),
  }
}

function mapOrderEventToGql(event: OrderEvent): AccountOrderEventGql {
  return {
    id: event.id,
    type: event.type,
    message: event.message ?? event.type,
    createdAt: event.createdAt.toISOString(),
  }
}

/**
 * Maps a Prisma order graph to the account GraphQL order type.
 */
export function mapOrderToGql(order: OrderWithRelations): AccountOrderGql {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: derivePaymentStatus(order),
    fulfillmentStatus: order.fulfillmentStatus,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    customizationTotalCents: order.customizationTotalCents,
    shippingCostCents: order.shippingCents,
    discountTotalCents: order.discountCents,
    taxTotalCents: order.taxCents,
    totalCents: order.totalCents,
    placedAt: toIso(order.placedAt),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(mapOrderItemToGql),
    payments: order.payments.map(mapPaymentToGql),
    shipments: order.shipments.map(mapShipmentToGql),
    events: order.events.map(mapOrderEventToGql),
    paymentActions: resolveAccountPaymentActions(
      order as OrderWithRelations & {
        payments: Array<Payment & { attempts: PaymentAttempt[] }>
      },
    ),
  }
}

/**
 * Maps a design row with optional product to account GraphQL design type.
 */
export function mapDesignToGql(
  design: Design,
  product: CatalogProductGql | null,
): AccountDesignGql {
  const config = parseJsonRecord(design.configJson) as DesignConfig

  return {
    id: design.id,
    name: design.name,
    status: design.status,
    previewUrl: design.previewUrl,
    previewPublicId: design.previewPublicId,
    finalPriceCents: config.finalPriceCents ?? 0,
    currency: config.currency ?? 'MXN',
    configJson: design.configJson,
    createdAt: design.createdAt.toISOString(),
    updatedAt: design.updatedAt.toISOString(),
    purchasedAt:
      design.status === DesignStatus.PURCHASED
        ? design.updatedAt.toISOString()
        : null,
    product,
  }
}

/**
 * Maps a loaded Prisma product graph for design embedding (catalog Product shape).
 */
export function mapProductForDesign(
  product: Parameters<typeof mapProductToGql>[0],
): CatalogProductGql {
  return mapProductToGql(product)
}
