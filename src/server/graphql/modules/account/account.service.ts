import { AddressType, OrderStatus, ProductStatus, type Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'
import { requireAuthenticatedAccount, requireVerifiedEmailForOrderDetail } from './account.auth'
import {
  mapAddressInputToPrisma,
  mapAddressToGql,
  mapDesignToGql,
  mapOrderToGql,
  mapProductForDesign,
  mapUserToAccountUser,
} from './account.mappers'
import type {
  AccountAddressGql,
  AccountDashboardSummaryGql,
  AccountDesignGql,
  AccountOrderGql,
  AccountUserGql,
  MyAddressInput,
  MyDesignsInput,
  PaginationInput,
  UpdateMyProfileInput,
} from './account.types'
import {
  designStatusSchema,
  myAddressInputSchema,
  parseAddressType,
  parsePagination,
  updateMyProfileSchema,
} from './account.validation'

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAID,
  OrderStatus.IN_PRODUCTION,
  OrderStatus.READY_TO_SHIP,
  OrderStatus.SHIPPED,
]

const orderInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      attempts: { orderBy: { createdAt: 'desc' as const }, take: 5 },
    },
  },
  shipments: { orderBy: { createdAt: 'asc' as const } },
  events: { orderBy: { createdAt: 'asc' as const } },
} satisfies Prisma.OrderInclude

const userWithRolesInclude = {
  roles: { include: { role: true } },
} satisfies Prisma.UserInclude

const productForDesignInclude = {
  productType: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { deletedAt: null },
    include: { color: true, size: true },
  },
  customizationRules: {
    where: { isEnabled: true },
    include: { area: true, option: true },
  },
} satisfies Prisma.ProductInclude

function notFoundAddress(): never {
  throw new GraphQLError('Dirección no encontrada.', {
    extensions: { code: 'NOT_FOUND' },
  })
}

async function clearDefaultAddresses(
  prisma: GraphQLContext['prisma'],
  userId: string,
  type: AddressType,
  exceptId?: string,
) {
  await prisma.address.updateMany({
    where: {
      userId,
      deletedAt: null,
      type,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isDefault: false },
  })
}

async function resolveDesignProducts(
  prisma: GraphQLContext['prisma'],
  designs: { configJson: unknown }[],
) {
  const slugs = new Set<string>()
  for (const design of designs) {
    const config = design.configJson as { productSlug?: string }
    if (config?.productSlug) slugs.add(config.productSlug)
  }

  if (slugs.size === 0) return new Map<string, ReturnType<typeof mapProductForDesign>>()

  const products = await prisma.product.findMany({
    where: {
      slug: { in: [...slugs] },
      deletedAt: null,
      status: ProductStatus.ACTIVE,
    },
    include: productForDesignInclude,
  })

  const map = new Map<string, ReturnType<typeof mapProductForDesign>>()
  for (const product of products) {
    map.set(product.slug, mapProductForDesign(product))
  }
  return map
}

/**
 * Returns the authenticated user's profile.
 */
export async function getMeProfile(context: GraphQLContext): Promise<AccountUserGql> {
  const userId = requireAuthenticatedAccount(context)

  const user = await context.prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: userWithRolesInclude,
  })

  if (!user) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  return mapUserToAccountUser(user)
}

/**
 * Returns dashboard summary data for the authenticated user.
 */
export async function getMyAccountSummary(
  context: GraphQLContext,
): Promise<AccountDashboardSummaryGql> {
  const userId = requireAuthenticatedAccount(context)

  const [totalOrders, activeOrders, savedDesigns, defaultShipping, recentOrders, recentDesigns] =
    await Promise.all([
      context.prisma.order.count({
        where: { userId, deletedAt: null },
      }),
      context.prisma.order.count({
        where: {
          userId,
          deletedAt: null,
          status: { in: ACTIVE_ORDER_STATUSES },
        },
      }),
      context.prisma.design.count({
        where: { userId, deletedAt: null },
      }),
      context.prisma.address.findFirst({
        where: {
          userId,
          deletedAt: null,
          type: { in: [AddressType.SHIPPING, AddressType.BOTH] },
          isDefault: true,
        },
      }),
      context.prisma.order.findMany({
        where: { userId, deletedAt: null },
        include: orderInclude,
        orderBy: [{ placedAt: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
      context.prisma.design.findMany({
        where: { userId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ])

  const productMap = await resolveDesignProducts(context.prisma, recentDesigns)

  return {
    totalOrders,
    activeOrders,
    savedDesigns,
    defaultShippingAddress: defaultShipping ? mapAddressToGql(defaultShipping) : null,
    recentOrders: recentOrders.map(mapOrderToGql),
    recentDesigns: recentDesigns.map((design) => {
      const slug = (design.configJson as { productSlug?: string }).productSlug
      return mapDesignToGql(design, slug ? (productMap.get(slug) ?? null) : null)
    }),
  }
}

/**
 * Lists orders for the authenticated user.
 */
export async function getMyOrders(
  context: GraphQLContext,
  input?: PaginationInput,
): Promise<AccountOrderGql[]> {
  const userId = requireAuthenticatedAccount(context)
  const { limit, offset } = parsePagination(input)

  const orders = await context.prisma.order.findMany({
    where: { userId, deletedAt: null },
    include: orderInclude,
    orderBy: [{ placedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    skip: offset,
  })

  return orders.map(mapOrderToGql)
}

/**
 * Returns a single order by order number for the authenticated user.
 */
export async function getMyOrderByNumber(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AccountOrderGql | null> {
  const userId = requireAuthenticatedAccount(context)
  requireVerifiedEmailForOrderDetail(context)

  const order = await context.prisma.order.findFirst({
    where: {
      orderNumber,
      userId,
      deletedAt: null,
    },
    include: orderInclude,
  })

  if (!order) return null
  return mapOrderToGql(order)
}

/**
 * Lists saved designs for the authenticated user.
 */
export async function getMyDesigns(
  context: GraphQLContext,
  input?: MyDesignsInput,
): Promise<AccountDesignGql[]> {
  const userId = requireAuthenticatedAccount(context)
  const { limit, offset } = parsePagination(input)
  const status = designStatusSchema.parse(input?.status)

  const designs = await context.prisma.design.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset,
  })

  const productMap = await resolveDesignProducts(context.prisma, designs)

  return designs.map((design) => {
    const slug = (design.configJson as { productSlug?: string }).productSlug
    return mapDesignToGql(design, slug ? (productMap.get(slug) ?? null) : null)
  })
}

/**
 * Lists addresses for the authenticated user.
 */
export async function getMyAddresses(context: GraphQLContext): Promise<AccountAddressGql[]> {
  const userId = requireAuthenticatedAccount(context)

  const addresses = await context.prisma.address.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
  })

  return addresses.map(mapAddressToGql)
}

/**
 * Updates profile fields for the authenticated user (not email or roles).
 */
export async function updateMyProfile(
  context: GraphQLContext,
  input: UpdateMyProfileInput,
): Promise<AccountUserGql> {
  const userId = requireAuthenticatedAccount(context)
  const data = updateMyProfileSchema.parse(input)

  const firstName = data.firstName ?? undefined
  const lastName = data.lastName ?? undefined
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || undefined

  const user = await context.prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName !== undefined ? { firstName } : {}),
      ...(lastName !== undefined ? { lastName } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.marketingOptIn !== undefined && data.marketingOptIn !== null
        ? { marketingOptIn: data.marketingOptIn }
        : {}),
    },
    include: userWithRolesInclude,
  })

  return mapUserToAccountUser(user)
}

/**
 * Creates a new address for the authenticated user.
 */
export async function createMyAddress(
  context: GraphQLContext,
  input: MyAddressInput,
): Promise<AccountAddressGql> {
  const userId = requireAuthenticatedAccount(context)
  const validated = myAddressInputSchema.parse(input)
  const prismaData = mapAddressInputToPrisma(validated)

  if (validated.isDefault) {
    await clearDefaultAddresses(context.prisma, userId, validated.type)
  }

  const address = await context.prisma.address.create({
    data: {
      userId,
      type: validated.type,
      isDefault: validated.isDefault ?? false,
      ...prismaData,
    },
  })

  return mapAddressToGql(address)
}

/**
 * Updates an address owned by the authenticated user.
 */
export async function updateMyAddress(
  context: GraphQLContext,
  id: string,
  input: MyAddressInput,
): Promise<AccountAddressGql> {
  const userId = requireAuthenticatedAccount(context)
  const validated = myAddressInputSchema.parse(input)
  const prismaData = mapAddressInputToPrisma(validated)

  const existing = await context.prisma.address.findFirst({
    where: { id, userId, deletedAt: null },
  })

  if (!existing) notFoundAddress()

  if (validated.isDefault) {
    await clearDefaultAddresses(context.prisma, userId, validated.type, id)
  }

  const address = await context.prisma.address.update({
    where: { id },
    data: {
      type: validated.type,
      ...(validated.isDefault !== undefined && validated.isDefault !== null
        ? { isDefault: validated.isDefault }
        : {}),
      ...prismaData,
    },
  })

  return mapAddressToGql(address)
}

/**
 * Soft-deletes an address owned by the authenticated user.
 */
export async function deleteMyAddress(context: GraphQLContext, id: string): Promise<boolean> {
  const userId = requireAuthenticatedAccount(context)

  const existing = await context.prisma.address.findFirst({
    where: { id, userId, deletedAt: null },
  })

  if (!existing) notFoundAddress()

  await context.prisma.address.update({
    where: { id },
    data: { deletedAt: new Date(), isDefault: false },
  })

  return true
}

/**
 * Sets the default address for a given type (shipping/billing).
 */
export async function setDefaultAddress(
  context: GraphQLContext,
  id: string,
  type: string,
): Promise<AccountAddressGql> {
  const userId = requireAuthenticatedAccount(context)
  const addressType = parseAddressType(type)

  const existing = await context.prisma.address.findFirst({
    where: { id, userId, deletedAt: null },
  })

  if (!existing) notFoundAddress()

  await clearDefaultAddresses(context.prisma, userId, addressType, id)

  const address = await context.prisma.address.update({
    where: { id },
    data: {
      type: addressType,
      isDefault: true,
    },
  })

  return mapAddressToGql(address)
}
