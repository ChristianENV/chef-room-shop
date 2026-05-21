import {
  FulfillmentStatus,
  OrderEventType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ShipmentStatus,
  ShippingProvider,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { CurrentUser } from '@/src/server/auth/types'
import {
  cancelSkydropxLabelOrShipment,
  createSkydropxShipment,
  getSkydropxTracking,
} from '@/src/server/shipping/skydropx/skydropx.client'
import { SkydropxApiError } from '@/src/server/shipping/skydropx/skydropx.errors'
import {
  mapLabelFormatToSkydropx,
  mapOrderToSkydropxShipmentPayload,
  parseSkydropxShipmentResponse,
} from '@/src/server/shipping/skydropx/skydropx.mappers'

import { derivePaymentStatus } from '../admin-dashboard/admin-dashboard.mappers'
import type { GraphQLContext } from '../../context'
import { requireAdminGraphQL } from './admin-shipping.auth'
import {
  mapShipmentToAdminGql,
  type ShipmentWithOrderAndEvents,
} from './admin-shipping.mappers'
import type {
  AdminCancelShippingLabelInput,
  AdminCreateShippingLabelInput,
  AdminShipmentGql,
} from './admin-shipping.types'
import {
  adminCancelShippingLabelInputSchema,
  adminCreateShippingLabelInputSchema,
  orderNumberSchema,
} from './admin-shipping.validation'

const shipmentInclude = {
  order: { select: { orderNumber: true } },
  events: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.ShipmentInclude

const ELIGIBLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY_TO_SHIP,
]

function actorDisplayName(user: CurrentUser): string {
  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fromParts || user.name || user.email
}

function notFoundError(message = 'Orden no encontrada.'): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

function badRequestError(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'BAD_REQUEST' } })
}

function conflictError(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'CONFLICT' } })
}

function skydropxGraphQLError(error: SkydropxApiError): GraphQLError {
  return new GraphQLError(
    error.message || 'No se pudo completar la operación con Skydropx.',
    { extensions: { code: 'SKYDROPX_API_ERROR', status: error.status } },
  )
}

async function createAdminOrderEvent(
  tx: Prisma.TransactionClient,
  params: {
    orderId: string
    type: OrderEventType
    message: string
    actor: CurrentUser
  },
): Promise<void> {
  await tx.orderEvent.create({
    data: {
      orderId: params.orderId,
      type: params.type,
      message: params.message,
      metadataJson: {
        actorId: params.actor.id,
        actorName: actorDisplayName(params.actor),
      },
    },
  })
}

async function loadShipmentByOrderNumber(
  context: GraphQLContext,
  orderNumber: string,
): Promise<ShipmentWithOrderAndEvents | null> {
  const shipment = await context.prisma.shipment.findFirst({
    where: {
      order: { orderNumber, deletedAt: null },
    },
    include: shipmentInclude,
    orderBy: { createdAt: 'desc' },
  })

  return shipment
}

function assertOrderEligibleForLabel(order: {
  status: OrderStatus
  payments: { status: PaymentStatus }[]
}): void {
  const paymentStatus = derivePaymentStatus(
    order as Parameters<typeof derivePaymentStatus>[0],
  )
  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
    throw badRequestError('No se puede generar guía para un pedido cancelado.')
  }

  if (order.status === OrderStatus.DELIVERED) {
    throw badRequestError('No se puede generar guía para un pedido ya entregado.')
  }

  if (order.status === OrderStatus.PENDING_PAYMENT) {
    throw badRequestError('El pedido debe estar pagado antes de generar la guía.')
  }

  if (paymentStatus !== PaymentStatus.PAID) {
    throw badRequestError('El pedido debe estar pagado antes de generar la guía.')
  }

  if (!ELIGIBLE_ORDER_STATUSES.includes(order.status)) {
    throw badRequestError(
      'El pedido debe estar pagado, en producción o listo para envío para generar la guía.',
    )
  }
}

function hasActiveSkydropxLabel(shipment: {
  providerShipmentId: string | null
  labelUrl: string | null
  status: ShipmentStatus
}): boolean {
  if (shipment.status === ShipmentStatus.CANCELLED) return false
  return Boolean(shipment.providerShipmentId?.trim() || shipment.labelUrl?.trim())
}

/**
 * Returns the admin shipment for an order, or null if none exists.
 */
export async function getAdminShipmentByOrderNumber(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AdminShipmentGql | null> {
  requireAdminGraphQL(context)
  const parsed = orderNumberSchema.parse(orderNumber)
  const shipment = await loadShipmentByOrderNumber(context, parsed)
  return shipment ? mapShipmentToAdminGql(shipment) : null
}

/**
 * Creates a Skydropx shipping label for a paid order and persists shipment data.
 */
export async function createAdminShippingLabel(
  context: GraphQLContext,
  input: AdminCreateShippingLabelInput,
): Promise<AdminShipmentGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = adminCreateShippingLabelInputSchema.parse(input)

  const order = await context.prisma.order.findFirst({
    where: { orderNumber: parsed.orderNumber, deletedAt: null },
    include: {
      shippingAddress: true,
      shipments: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  if (!order) {
    throw notFoundError()
  }

  assertOrderEligibleForLabel(order)

  const existingShipment = order.shipments[0]
  if (existingShipment && hasActiveSkydropxLabel(existingShipment)) {
    throw conflictError('La guía ya fue generada.')
  }

  const quote = await context.prisma.shippingQuote.findFirst({
    where: { orderId: order.id },
    include: { rates: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!quote) {
    throw badRequestError(
      'No hay cotización de envío vinculada al pedido. El cliente debe cotizar en checkout.',
    )
  }

  let rate = quote.rates.find((r) => r.selectedAt !== null) ?? null

  if (parsed.rateId) {
    const explicit = quote.rates.find((r) => r.id === parsed.rateId)
    if (!explicit) {
      throw badRequestError('La tarifa no pertenece a la cotización del pedido.')
    }
    rate = explicit
  }

  if (!rate) {
    throw badRequestError(
      'No hay tarifa de envío seleccionada. Selecciona una tarifa en checkout o indica rateId.',
    )
  }

  if (rate.expiresAt && rate.expiresAt <= new Date()) {
    throw badRequestError(
      'La tarifa de envío expiró. Cotiza nuevamente antes de generar guía.',
    )
  }

  if (!rate.providerRateId?.trim()) {
    throw badRequestError('La tarifa no tiene identificador de proveedor válido.')
  }

  const address = order.shippingAddress
  if (!address) {
    throw badRequestError('El pedido no tiene dirección de envío.')
  }

  const printingFormat = mapLabelFormatToSkydropx(parsed.labelFormat ?? 'PDF')
  const skydropxPayload = mapOrderToSkydropxShipmentPayload({
    providerRateId: rate.providerRateId,
    printingFormat,
    packageJson: quote.packageJson,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    shippingAddress: {
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
    },
  })

  let skydropxRaw: unknown
  try {
    skydropxRaw = await createSkydropxShipment(skydropxPayload)
  } catch (error) {
    if (error instanceof SkydropxApiError) {
      throw skydropxGraphQLError(error)
    }
    throw error
  }

  const parsedShipment = parseSkydropxShipmentResponse(skydropxRaw)
  const costCents = rate.amountCents ?? parsedShipment.costCents
  const labelFormat = (parsed.labelFormat ?? 'PDF').toUpperCase()
  const hasTracking = Boolean(parsedShipment.trackingNumber?.trim())

  const shipmentStatus = hasTracking
    ? ShipmentStatus.IN_TRANSIT
    : ShipmentStatus.LABEL_CREATED

  const orderStatus = hasTracking ? OrderStatus.SHIPPED : OrderStatus.READY_TO_SHIP
  const fulfillmentStatus = hasTracking
    ? FulfillmentStatus.SHIPPED
    : FulfillmentStatus.PROCESSING

  const carrierLabel = parsedShipment.carrier ?? rate.carrier ?? 'paquetería'
  const eventMessage = `Guía generada con ${carrierLabel}.`

  const created = await context.prisma.$transaction(async (tx) => {
    const shipment = await tx.shipment.create({
      data: {
        orderId: order.id,
        status: shipmentStatus,
        provider: ShippingProvider.SKYDROPX,
        providerShipmentId: parsedShipment.providerShipmentId,
        providerLabelId: parsedShipment.providerLabelId,
        labelUrl: parsedShipment.labelUrl,
        labelFormat,
        quoteId: quote.id,
        rateId: rate.id,
        carrier: parsedShipment.carrier ?? rate.carrier,
        service: parsedShipment.service ?? rate.service,
        costCents,
        currency: rate.currency,
        trackingNumber: parsedShipment.trackingNumber,
        shippedAt: hasTracking ? new Date() : null,
        rawResponseJson: parsedShipment.rawJson as Prisma.InputJsonValue,
      },
      include: shipmentInclude,
    })

    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: shipmentStatus,
        message: hasTracking
          ? `Etiqueta creada. Tracking: ${parsedShipment.trackingNumber}`
          : 'Etiqueta creada en Skydropx.',
        metadataJson: {
          providerShipmentId: parsedShipment.providerShipmentId,
          labelUrl: parsedShipment.labelUrl,
        },
      },
    })

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        fulfillmentStatus,
      },
    })

    await createAdminOrderEvent(tx, {
      orderId: order.id,
      type: OrderEventType.FULFILLMENT_UPDATED,
      message: eventMessage,
      actor: admin,
    })

    const withEvents = await tx.shipment.findUniqueOrThrow({
      where: { id: shipment.id },
      include: shipmentInclude,
    })

    return withEvents
  })

  return mapShipmentToAdminGql(created)
}

/**
 * Cancels a Skydropx label/shipment for an order (admin only).
 */
export async function cancelAdminShippingLabel(
  context: GraphQLContext,
  input: AdminCancelShippingLabelInput,
): Promise<AdminShipmentGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = adminCancelShippingLabelInputSchema.parse(input)

  const shipment = await loadShipmentByOrderNumber(context, parsed.orderNumber)
  if (!shipment) {
    throw notFoundError('No hay envío registrado para este pedido.')
  }

  if (!shipment.providerShipmentId?.trim()) {
    throw badRequestError('Este envío no tiene guía Skydropx que cancelar.')
  }

  if (shipment.status === ShipmentStatus.CANCELLED) {
    return mapShipmentToAdminGql(shipment)
  }

  try {
    await cancelSkydropxLabelOrShipment(shipment.providerShipmentId)
  } catch (error) {
    if (error instanceof SkydropxApiError) {
      throw skydropxGraphQLError(error)
    }
    throw error
  }

  const cancelMessage = parsed.reason?.trim()
    ? `Guía cancelada: ${parsed.reason.trim()}`
    : 'Guía de envío cancelada en Skydropx.'

  const updated = await context.prisma.$transaction(async (tx) => {
    const next = await tx.shipment.update({
      where: { id: shipment.id },
      data: { status: ShipmentStatus.CANCELLED },
      include: shipmentInclude,
    })

    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.CANCELLED,
        message: cancelMessage,
      },
    })

    await createAdminOrderEvent(tx, {
      orderId: shipment.orderId,
      type: OrderEventType.FULFILLMENT_UPDATED,
      message: cancelMessage,
      actor: admin,
    })

    return next
  })

  return mapShipmentToAdminGql(updated)
}

/**
 * Refreshes tracking from Skydropx for an existing shipment.
 */
export async function refreshAdminShipmentTracking(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AdminShipmentGql> {
  requireAdminGraphQL(context)
  const parsed = orderNumberSchema.parse(orderNumber)

  const shipment = await loadShipmentByOrderNumber(context, parsed)
  if (!shipment) {
    throw notFoundError('No hay envío registrado para este pedido.')
  }

  const tracking = shipment.trackingNumber?.trim()
  const carrier = shipment.carrier?.trim()

  if (!tracking || !carrier) {
    throw badRequestError(
      'El envío no tiene número de rastreo o paquetería para consultar Skydropx.',
    )
  }

  let skydropxRaw: unknown
  try {
    skydropxRaw = await getSkydropxTracking({
      tracking_number: tracking,
      carrier_name: carrier,
    })
  } catch (error) {
    if (error instanceof SkydropxApiError) {
      throw skydropxGraphQLError(error)
    }
    throw error
  }

  const parsedTracking = parseSkydropxShipmentResponse(skydropxRaw)
  const nextTracking = parsedTracking.trackingNumber ?? tracking
  const nextStatus =
    parsedTracking.trackingNumber && shipment.status === ShipmentStatus.LABEL_CREATED
      ? ShipmentStatus.IN_TRANSIT
      : shipment.status

  const updated = await context.prisma.$transaction(async (tx) => {
    const next = await tx.shipment.update({
      where: { id: shipment.id },
      data: {
        trackingNumber: nextTracking,
        status: nextStatus,
        labelUrl: parsedTracking.labelUrl ?? shipment.labelUrl,
        shippedAt: shipment.shippedAt ?? (nextTracking ? new Date() : null),
      },
      include: shipmentInclude,
    })

    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: nextStatus,
        message: 'Tracking actualizado desde Skydropx.',
        metadataJson: {
          trackingNumber: nextTracking,
          carrier,
        },
      },
    })

    return next
  })

  return mapShipmentToAdminGql(updated)
}
