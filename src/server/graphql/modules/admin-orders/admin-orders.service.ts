import {
  FulfillmentStatus,
  OrderEventType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ShipmentStatus,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'
import type { CurrentUser } from '@/src/server/auth/types'

import { requireAdminGraphQL } from './admin-orders.auth'
import {
  canMoveToProduction,
  mapOrderToAdminGql,
  mapOrderToProductionSheetGql,
  type AdminOrderWithRelations,
} from './admin-orders.mappers'
import type {
  AdminOrderGql,
  AdminOrdersListInput,
  AdminOrdersPayloadGql,
  AdminOrderStatusSummaryGql,
  AdminProductionSheetGql,
  AddAdminOrderNoteInput,
  AddAdminOrderTrackingInput,
  UpdateAdminOrderStatusInput,
} from './admin-orders.types'
import {
  addAdminOrderNoteInputSchema,
  addAdminOrderTrackingInputSchema,
  cancelAdminOrderSchema,
  orderNumberSchema,
  parseAdminOrdersListInput,
  parseAdminProductionQueueLimit,
  updateAdminOrderStatusInputSchema,
} from './admin-orders.validation'

const PRODUCTION_QUEUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY_TO_SHIP,
]

const PRODUCTION_ONLY_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY_TO_SHIP,
]

const orderDetailInclude = {
  user: true,
  items: { orderBy: { createdAt: 'asc' as const } },
  payments: { orderBy: { createdAt: 'desc' as const } },
  shipments: { orderBy: { createdAt: 'desc' as const } },
  events: { orderBy: { createdAt: 'desc' as const } },
  shippingAddress: true,
  billingAddress: true,
} satisfies Prisma.OrderInclude

function actorDisplayName(user: CurrentUser): string {
  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fromParts || user.name || user.email
}

function notFoundError(): GraphQLError {
  return new GraphQLError('Orden no encontrada.', {
    extensions: { code: 'NOT_FOUND' },
  })
}

function forbiddenAction(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'FORBIDDEN' },
  })
}

async function loadOrderByNumber(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AdminOrderWithRelations> {
  const order = await context.prisma.order.findFirst({
    where: { orderNumber, deletedAt: null },
    include: orderDetailInclude,
  })

  if (!order) {
    throw notFoundError()
  }

  return order
}

function buildSearchWhere(search: string): Prisma.OrderWhereInput {
  const term = search.trim()
  return {
    OR: [
      { orderNumber: { contains: term, mode: 'insensitive' } },
      { customerEmail: { contains: term, mode: 'insensitive' } },
      { customerPhone: { contains: term, mode: 'insensitive' } },
      {
        user: {
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
          ],
        },
      },
    ],
  }
}

function buildListWhere(
  filter: AdminOrdersListInput['filter'],
): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = { deletedAt: null }

  if (filter?.search) {
    Object.assign(where, buildSearchWhere(filter.search))
  }

  if (filter?.status) {
    where.status = filter.status as OrderStatus
  }

  if (filter?.fulfillmentStatus) {
    where.fulfillmentStatus = filter.fulfillmentStatus as FulfillmentStatus
  }

  if (filter?.paymentStatus) {
    where.payments = {
      some: { status: filter.paymentStatus as PaymentStatus },
    }
  }

  if (filter?.productionOnly) {
    where.status = { in: PRODUCTION_ONLY_STATUSES }
  }

  if (filter?.hasCustomDesign === true) {
    where.items = {
      some: {
        OR: [
          { designId: { not: null } },
          { designSnapshotJson: { not: Prisma.AnyNull } },
        ],
      },
    }
  } else if (filter?.hasCustomDesign === false) {
    where.NOT = {
      items: {
        some: {
          OR: [
            { designId: { not: null } },
            { designSnapshotJson: { not: Prisma.AnyNull } },
          ],
        },
      },
    }
  }

  if (filter?.dateFrom || filter?.dateTo) {
    where.createdAt = {}
    if (filter.dateFrom) {
      where.createdAt.gte = new Date(filter.dateFrom)
    }
    if (filter.dateTo) {
      const end = new Date(filter.dateTo)
      end.setHours(23, 59, 59, 999)
      where.createdAt.lte = end
    }
  }

  return where
}

function buildListOrderBy(
  sort: AdminOrdersListInput['sort'],
): Prisma.OrderOrderByWithRelationInput {
  const field = sort?.field ?? 'createdAt'
  const direction = sort?.direction === 'asc' ? 'asc' : 'desc'

  switch (field) {
    case 'totalCents':
      return { totalCents: direction }
    case 'status':
      return { status: direction }
    case 'orderNumber':
      return { orderNumber: direction }
    case 'paymentStatus':
      return { status: direction }
    default:
      return { createdAt: direction }
  }
}

async function appendOrderNote(
  tx: Prisma.TransactionClient,
  orderId: string,
  note: string,
  existingNotes: string | null,
): Promise<void> {
  const stamp = new Date().toISOString()
  const line = `[${stamp}] ${note}`
  const merged = existingNotes?.trim() ? `${existingNotes.trim()}\n${line}` : line
  await tx.order.update({
    where: { id: orderId },
    data: { notes: merged },
  })
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

/**
 * Lists orders for admin with filters, sort and pagination.
 */
export async function getAdminOrders(
  context: GraphQLContext,
  input: unknown,
): Promise<AdminOrdersPayloadGql> {
  requireAdminGraphQL(context)
  const parsed = parseAdminOrdersListInput(input)
  const where = buildListWhere(parsed.filter)

  const [total, orders] = await Promise.all([
    context.prisma.order.count({ where }),
    context.prisma.order.findMany({
      where,
      include: orderDetailInclude,
      orderBy: buildListOrderBy(parsed.sort),
      take: parsed.limit,
      skip: parsed.offset,
    }),
  ])

  return {
    items: orders.map(mapOrderToAdminGql),
    total,
  }
}

/**
 * Returns full admin order detail by order number.
 */
export async function getAdminOrderByNumber(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AdminOrderGql | null> {
  requireAdminGraphQL(context)
  const parsedNumber = orderNumberSchema.parse(orderNumber)

  const order = await context.prisma.order.findFirst({
    where: { orderNumber: parsedNumber, deletedAt: null },
    include: orderDetailInclude,
  })

  if (!order) return null
  return mapOrderToAdminGql(order)
}

/**
 * Counts orders grouped by primary order status for dashboard cards.
 */
export async function getAdminOrderStatusSummary(
  context: GraphQLContext,
): Promise<AdminOrderStatusSummaryGql> {
  requireAdminGraphQL(context)

  const baseWhere: Prisma.OrderWhereInput = { deletedAt: null }

  const [
    pendingPayment,
    paid,
    inProduction,
    readyToShip,
    shipped,
    delivered,
    cancelled,
  ] = await Promise.all([
    context.prisma.order.count({
      where: { ...baseWhere, status: OrderStatus.PENDING_PAYMENT },
    }),
    context.prisma.order.count({
      where: { ...baseWhere, status: OrderStatus.PAID },
    }),
    context.prisma.order.count({
      where: { ...baseWhere, status: OrderStatus.IN_PRODUCTION },
    }),
    context.prisma.order.count({
      where: { ...baseWhere, status: OrderStatus.READY_TO_SHIP },
    }),
    context.prisma.order.count({
      where: { ...baseWhere, status: OrderStatus.SHIPPED },
    }),
    context.prisma.order.count({
      where: { ...baseWhere, status: OrderStatus.DELIVERED },
    }),
    context.prisma.order.count({
      where: {
        ...baseWhere,
        status: { in: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
    }),
  ])

  return {
    pendingPayment,
    paid,
    inProduction,
    readyToShip,
    shipped,
    delivered,
    cancelled,
  }
}

/**
 * Returns orders in the production pipeline (paid → ready to ship).
 */
export async function getAdminOrderProductionQueue(
  context: GraphQLContext,
  limit: unknown,
): Promise<AdminOrderGql[]> {
  requireAdminGraphQL(context)
  const take = parseAdminProductionQueueLimit(limit)

  const orders = await context.prisma.order.findMany({
    where: {
      deletedAt: null,
      status: { in: PRODUCTION_QUEUE_STATUSES },
    },
    include: orderDetailInclude,
    orderBy: [{ updatedAt: 'asc' }, { createdAt: 'asc' }],
    take,
  })

  return orders.map(mapOrderToAdminGql)
}

/**
 * Returns production sheet data for internal ops.
 */
export async function getAdminOrderProductionSheet(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AdminProductionSheetGql> {
  requireAdminGraphQL(context)
  const order = await loadOrderByNumber(context, orderNumberSchema.parse(orderNumber))
  return mapOrderToProductionSheetGql(order)
}

/**
 * Updates order status with audit event.
 */
export async function updateAdminOrderStatus(
  context: GraphQLContext,
  input: UpdateAdminOrderStatusInput,
): Promise<AdminOrderGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = updateAdminOrderStatusInputSchema.parse(input)
  const order = await loadOrderByNumber(context, parsed.orderNumber)

  if (order.status === OrderStatus.DELIVERED && parsed.status !== OrderStatus.DELIVERED) {
    throw forbiddenAction('No se puede cambiar el estado de un pedido entregado.')
  }

  const message =
    parsed.message?.trim() ||
    `Estado actualizado a ${parsed.status} por operaciones.`

  await context.prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: parsed.status as OrderStatus },
    })
    await createAdminOrderEvent(tx, {
      orderId: order.id,
      type: OrderEventType.STATUS_CHANGED,
      message,
      actor: admin,
    })
  })

  return mapOrderToAdminGql(await loadOrderByNumber(context, parsed.orderNumber))
}

/**
 * Moves a paid order into production.
 */
export async function moveAdminOrderToProduction(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AdminOrderGql> {
  const admin = requireAdminGraphQL(context)
  const parsedNumber = orderNumberSchema.parse(orderNumber)
  const order = await loadOrderByNumber(context, parsedNumber)

  if (!canMoveToProduction(order)) {
    throw forbiddenAction(
      'Solo pedidos pagados pueden enviarse a producción.',
    )
  }

  if (
    order.status === OrderStatus.CANCELLED ||
    order.status === OrderStatus.REFUNDED ||
    order.status === OrderStatus.DELIVERED
  ) {
    throw forbiddenAction('No se puede enviar este pedido a producción.')
  }

  await context.prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.IN_PRODUCTION,
        fulfillmentStatus: FulfillmentStatus.PROCESSING,
      },
    })
    await createAdminOrderEvent(tx, {
      orderId: order.id,
      type: OrderEventType.FULFILLMENT_UPDATED,
      message: 'Pedido enviado a producción.',
      actor: admin,
    })
  })

  return mapOrderToAdminGql(await loadOrderByNumber(context, parsedNumber))
}

/**
 * Marks order as ready to ship.
 */
export async function markAdminOrderReadyToShip(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AdminOrderGql> {
  const admin = requireAdminGraphQL(context)
  const parsedNumber = orderNumberSchema.parse(orderNumber)
  const order = await loadOrderByNumber(context, parsedNumber)

  if (
    order.status !== OrderStatus.IN_PRODUCTION &&
    order.status !== OrderStatus.PAID &&
    order.status !== OrderStatus.READY_TO_SHIP
  ) {
    throw forbiddenAction(
      'El pedido debe estar en producción o pagado para marcarlo listo para envío.',
    )
  }

  await context.prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.READY_TO_SHIP,
        fulfillmentStatus: FulfillmentStatus.PROCESSING,
      },
    })
    await createAdminOrderEvent(tx, {
      orderId: order.id,
      type: OrderEventType.FULFILLMENT_UPDATED,
      message: 'Pedido marcado como listo para envío.',
      actor: admin,
    })
  })

  return mapOrderToAdminGql(await loadOrderByNumber(context, parsedNumber))
}

/**
 * Adds or updates shipment tracking for an order.
 */
export async function addAdminOrderTracking(
  context: GraphQLContext,
  input: AddAdminOrderTrackingInput,
): Promise<AdminOrderGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = addAdminOrderTrackingInputSchema.parse(input)
  const order = await loadOrderByNumber(context, parsed.orderNumber)

  if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED) {
    throw forbiddenAction('No se puede agregar tracking a un pedido cancelado.')
  }

  const shippedAt = parsed.shippedAt ? new Date(parsed.shippedAt) : new Date()
  const shipmentStatus =
    (parsed.status as ShipmentStatus | undefined) ?? ShipmentStatus.IN_TRANSIT

  await context.prisma.$transaction(async (tx) => {
    const existing = order.shipments[0]

    if (existing) {
      await tx.shipment.update({
        where: { id: existing.id },
        data: {
          carrier: parsed.carrier,
          trackingNumber: parsed.trackingNumber,
          status: shipmentStatus,
          shippedAt,
        },
      })
      await tx.shipmentEvent.create({
        data: {
          shipmentId: existing.id,
          status: shipmentStatus,
          message: `Guía actualizada: ${parsed.trackingNumber}`,
        },
      })
    } else {
      const shipment = await tx.shipment.create({
        data: {
          orderId: order.id,
          carrier: parsed.carrier,
          trackingNumber: parsed.trackingNumber,
          status: shipmentStatus,
          shippedAt,
        },
      })
      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: shipmentStatus,
          message: `Guía registrada: ${parsed.trackingNumber}`,
        },
      })
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
      },
    })

    await createAdminOrderEvent(tx, {
      orderId: order.id,
      type: OrderEventType.FULFILLMENT_UPDATED,
      message: 'Guía de envío agregada.',
      actor: admin,
    })
  })

  return mapOrderToAdminGql(await loadOrderByNumber(context, parsed.orderNumber))
}

/**
 * Cancels an order (no automatic refund).
 */
export async function cancelAdminOrder(
  context: GraphQLContext,
  orderNumber: string,
  reason?: string | null,
): Promise<AdminOrderGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = cancelAdminOrderSchema.parse({ orderNumber, reason })
  const order = await loadOrderByNumber(context, parsed.orderNumber)

  if (order.status === OrderStatus.DELIVERED) {
    throw forbiddenAction('No se puede cancelar un pedido ya entregado.')
  }

  const cancelMessage = parsed.reason?.trim()
    ? `Pedido cancelado: ${parsed.reason.trim()}`
    : 'Pedido cancelado por operaciones.'

  await context.prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        fulfillmentStatus: FulfillmentStatus.CANCELLED,
      },
    })
    await createAdminOrderEvent(tx, {
      orderId: order.id,
      type: OrderEventType.CANCELLED,
      message: cancelMessage,
      actor: admin,
    })
  })

  return mapOrderToAdminGql(await loadOrderByNumber(context, parsed.orderNumber))
}

/**
 * Adds an internal note as OrderEvent and appends to order.notes.
 */
export async function addAdminOrderNote(
  context: GraphQLContext,
  input: AddAdminOrderNoteInput,
): Promise<AdminOrderGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = addAdminOrderNoteInputSchema.parse(input)
  const order = await loadOrderByNumber(context, parsed.orderNumber)

  await context.prisma.$transaction(async (tx) => {
    await appendOrderNote(tx, order.id, parsed.note, order.notes)
    await createAdminOrderEvent(tx, {
      orderId: order.id,
      type: OrderEventType.NOTE_ADDED,
      message: parsed.note,
      actor: admin,
    })
  })

  return mapOrderToAdminGql(await loadOrderByNumber(context, parsed.orderNumber))
}
