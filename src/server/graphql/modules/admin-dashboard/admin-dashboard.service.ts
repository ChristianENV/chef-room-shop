import { CartStatus, OrderStatus, RoleSlug, type Prisma } from '@prisma/client'

import type { GraphQLContext } from '../../context'
import { requireAdminGraphQL } from './admin-dashboard.auth'
import {
  mapDesignToAdminRecent,
  mapMetricsToGql,
  mapOrderToAdminRecent,
  mapOrderToProductionQueue,
  mapPaymentToAdminRecent,
  mapTopProductAggregates,
  startOfMonth,
  startOfToday,
  type TopProductAggregate,
} from './admin-dashboard.mappers'
import type {
  AdminDashboardMetricsGql,
  AdminProductionQueueItemGql,
  AdminRecentDesignGql,
  AdminRecentOrderGql,
  AdminRecentPaymentGql,
  AdminTopProductGql,
} from './admin-dashboard.types'
import {
  parseProductionQueueLimit,
  parseRecentDesignsLimit,
  parseRecentOrdersLimit,
  parseRecentPaymentsLimit,
  parseTopProductsLimit,
} from './admin-dashboard.validation'

/** Orders counted as paid revenue for dashboard metrics. */
const PAID_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY_TO_SHIP,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

const PRODUCTION_QUEUE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY_TO_SHIP,
]

const orderListInclude = {
  items: true,
  user: true,
  payments: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} satisfies Prisma.OrderInclude

const productionInclude = {
  items: true,
  user: true,
} satisfies Prisma.OrderInclude

function paidOrderDateWhere(since: Date): Prisma.OrderWhereInput {
  return {
    deletedAt: null,
    status: { in: PAID_ORDER_STATUSES },
    OR: [{ placedAt: { gte: since } }, { placedAt: null, createdAt: { gte: since } }],
  }
}

/**
 * Dashboard KPIs for admin users (paid sales, pending orders, carts, customers).
 * `designsCreated` counts designs created in the current calendar month.
 */
export async function getAdminDashboardMetrics(
  context: GraphQLContext,
): Promise<AdminDashboardMetricsGql> {
  requireAdminGraphQL(context)
  const { prisma } = context

  const todayStart = startOfToday()
  const monthStart = startOfMonth()
  const baseOrderWhere = { deletedAt: null } satisfies Prisma.OrderWhereInput

  const [
    salesToday,
    salesMonth,
    pendingOrders,
    designsCreated,
    abandonedCarts,
    paidOrderStats,
    totalOrders,
    totalCustomers,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: paidOrderDateWhere(todayStart),
      _sum: { totalCents: true },
    }),
    prisma.order.aggregate({
      where: paidOrderDateWhere(monthStart),
      _sum: { totalCents: true },
    }),
    prisma.order.count({
      where: {
        ...baseOrderWhere,
        status: OrderStatus.PENDING_PAYMENT,
      },
    }),
    prisma.design.count({
      where: {
        deletedAt: null,
        createdAt: { gte: monthStart },
      },
    }),
    prisma.cart.count({
      where: {
        deletedAt: null,
        status: CartStatus.ABANDONED,
      },
    }),
    prisma.order.aggregate({
      where: {
        ...baseOrderWhere,
        status: { in: PAID_ORDER_STATUSES },
      },
      _avg: { totalCents: true },
      _count: true,
    }),
    prisma.order.count({ where: baseOrderWhere }),
    prisma.user.count({
      where: {
        deletedAt: null,
        roles: { some: { role: { slug: RoleSlug.CUSTOMER } } },
      },
    }),
  ])

  const paidCount = paidOrderStats._count
  const averageOrderValueCents = paidCount > 0 ? Math.round(paidOrderStats._avg.totalCents ?? 0) : 0

  return mapMetricsToGql({
    salesTodayCents: salesToday._sum.totalCents ?? 0,
    salesMonthCents: salesMonth._sum.totalCents ?? 0,
    pendingOrders,
    designsCreated,
    abandonedCarts,
    averageOrderValueCents,
    totalOrders,
    totalCustomers,
  })
}

/**
 * Recent orders for admin dashboard (newest first).
 */
export async function getAdminRecentOrders(
  context: GraphQLContext,
  limit?: number | null,
): Promise<AdminRecentOrderGql[]> {
  requireAdminGraphQL(context)
  const take = parseRecentOrdersLimit(limit)

  const orders = await context.prisma.order.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take,
    include: orderListInclude,
  })

  return orders.map(mapOrderToAdminRecent)
}

/**
 * Production queue: paid / in-production / ready-to-ship orders (oldest first).
 */
export async function getAdminProductionQueue(
  context: GraphQLContext,
  limit?: number | null,
): Promise<AdminProductionQueueItemGql[]> {
  requireAdminGraphQL(context)
  const take = parseProductionQueueLimit(limit)

  const orders = await context.prisma.order.findMany({
    where: {
      deletedAt: null,
      status: { in: PRODUCTION_QUEUE_STATUSES },
    },
    orderBy: { createdAt: 'asc' },
    take,
    include: productionInclude,
  })

  return orders.map(mapOrderToProductionQueue)
}

/**
 * Recent saved designs (newest by updatedAt). Does not expose full configJson.
 */
export async function getAdminRecentDesigns(
  context: GraphQLContext,
  limit?: number | null,
): Promise<AdminRecentDesignGql[]> {
  requireAdminGraphQL(context)
  const take = parseRecentDesignsLimit(limit)

  const designs = await context.prisma.design.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    take,
    include: { user: true },
  })

  const slugs = new Set<string>()
  for (const design of designs) {
    const config = design.configJson as { productSlug?: string }
    if (config?.productSlug?.trim()) slugs.add(config.productSlug.trim())
  }

  const products =
    slugs.size > 0
      ? await context.prisma.product.findMany({
          where: { slug: { in: [...slugs] }, deletedAt: null },
          select: { slug: true, name: true },
        })
      : []

  const productNameBySlug = new Map(products.map((p) => [p.slug, p.name]))

  return designs.map((design) => mapDesignToAdminRecent(design, productNameBySlug))
}

/**
 * Recent payments (newest first). Webhook/raw payloads are never exposed.
 */
export async function getAdminRecentPayments(
  context: GraphQLContext,
  limit?: number | null,
): Promise<AdminRecentPaymentGql[]> {
  requireAdminGraphQL(context)
  const take = parseRecentPaymentsLimit(limit)

  const payments = await context.prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      order: { select: { orderNumber: true } },
    },
  })

  return payments.map(mapPaymentToAdminRecent)
}

/**
 * Top products by revenue from paid order line items (in-memory aggregation).
 */
export async function getAdminTopProducts(
  context: GraphQLContext,
  limit?: number | null,
): Promise<AdminTopProductGql[]> {
  requireAdminGraphQL(context)
  const take = parseTopProductsLimit(limit)

  const items = await context.prisma.orderItem.findMany({
    where: {
      order: {
        deletedAt: null,
        status: { in: PAID_ORDER_STATUSES },
      },
    },
    select: {
      orderId: true,
      quantity: true,
      lineTotalCents: true,
      customizationPriceCents: true,
      designId: true,
      productSnapshotJson: true,
    },
  })

  const slugsFromSnapshots = new Set<string>()
  for (const item of items) {
    const snapshot = item.productSnapshotJson as { slug?: string; productId?: string }
    if (snapshot?.slug?.trim()) slugsFromSnapshots.add(snapshot.slug.trim())
  }

  const products =
    slugsFromSnapshots.size > 0
      ? await context.prisma.product.findMany({
          where: { slug: { in: [...slugsFromSnapshots] }, deletedAt: null },
          select: { id: true, slug: true, name: true },
        })
      : []

  const productBySlug = new Map(products.map((p) => [p.slug, p]))

  const aggregates = new Map<string, TopProductAggregate>()

  for (const item of items) {
    const snapshot = item.productSnapshotJson as {
      slug?: string
      name?: string
      productId?: string
    }
    const slug = snapshot?.slug?.trim() || 'unknown'
    const product = productBySlug.get(slug)
    const key = product?.id ?? snapshot?.productId ?? slug

    const existing = aggregates.get(key) ?? {
      productId: product?.id ?? key,
      productName: product?.name ?? snapshot?.name?.trim() ?? slug,
      productSlug: product?.slug ?? slug,
      orderIds: new Set<string>(),
      quantitySold: 0,
      revenueCents: 0,
      customizedCount: 0,
    }

    existing.orderIds.add(item.orderId)
    existing.quantitySold += item.quantity
    existing.revenueCents += item.lineTotalCents
    if (item.designId || item.customizationPriceCents > 0) {
      existing.customizedCount += item.quantity
    }

    aggregates.set(key, existing)
  }

  return mapTopProductAggregates(aggregates, take)
}
