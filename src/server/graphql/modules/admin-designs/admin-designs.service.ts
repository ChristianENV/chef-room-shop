import { DesignStatus, Prisma } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'
import { requireAdminGraphQL } from './admin-designs.auth'
import {
  collectProductSlugsFromDesigns,
  loadProductNameBySlugMap,
  mapDesignToAdminDetailGql,
  mapDesignToAdminListItemGql,
  type DesignWithRelations,
} from './admin-designs.mappers'
import type {
  AdminDesignDetailGql,
  AdminDesignsListInput,
  AdminDesignsPayloadGql,
} from './admin-designs.types'
import { parseAdminDesignsListInput } from './admin-designs.validation'

const designListInclude = {
  user: {
    select: {
      name: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  orderItems: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: {
      order: {
        select: {
          orderNumber: true,
          deletedAt: true,
        },
      },
    },
  },
  cartItems: {
    orderBy: { updatedAt: 'desc' as const },
    take: 1,
    select: {
      cart: {
        select: {
          id: true,
          status: true,
          deletedAt: true,
        },
      },
    },
  },
} satisfies Prisma.DesignInclude

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function buildSearchWhere(search: string): Prisma.DesignWhereInput {
  const term = search.trim()
  const or: Prisma.DesignWhereInput[] = [
    { name: { contains: term, mode: 'insensitive' } },
    {
      user: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
    },
  ]

  if (isUuid(term)) {
    or.push({ id: term })
  }

  return { OR: or }
}

function buildListWhere(filter: AdminDesignsListInput['filter']): Prisma.DesignWhereInput {
  const and: Prisma.DesignWhereInput[] = [{ deletedAt: null }]

  if (filter?.search?.trim()) {
    and.push(buildSearchWhere(filter.search))
  }

  if (filter?.status) {
    and.push({ status: filter.status as DesignStatus })
  }

  if (filter?.ownerType === 'USER') {
    and.push({ userId: { not: null } })
  }

  if (filter?.ownerType === 'GUEST') {
    and.push({ userId: null })
  }

  return { AND: and }
}

async function loadDesignWithRelations(
  context: GraphQLContext,
  designId: string,
): Promise<DesignWithRelations | null> {
  return context.prisma.design.findFirst({
    where: { id: designId, deletedAt: null },
    include: designListInclude,
  })
}

/**
 * Read-only paginated designs list for admin panel.
 */
export async function getAdminDesigns(
  context: GraphQLContext,
  input: AdminDesignsListInput,
): Promise<AdminDesignsPayloadGql> {
  requireAdminGraphQL(context)

  const { filter, limit, offset } = parseAdminDesignsListInput(input)
  const where = buildListWhere(filter)

  const [designs, total] = await Promise.all([
    context.prisma.design.findMany({
      where,
      include: designListInclude,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    context.prisma.design.count({ where }),
  ])

  const productNameBySlug = await loadProductNameBySlugMap(
    context.prisma,
    collectProductSlugsFromDesigns(designs),
  )

  return {
    total,
    items: designs.map((design) => mapDesignToAdminListItemGql(design, productNameBySlug)),
  }
}

/**
 * Returns a single design with configJson for admin audit (detail modal).
 */
export async function getAdminDesignById(
  context: GraphQLContext,
  designId: string,
): Promise<AdminDesignDetailGql | null> {
  requireAdminGraphQL(context)

  const normalized = designId.trim()
  if (!normalized) {
    throw new GraphQLError('ID de diseño requerido.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const design = await loadDesignWithRelations(context, normalized)
  if (!design) return null

  const productNameBySlug = await loadProductNameBySlugMap(
    context.prisma,
    collectProductSlugsFromDesigns([design]),
  )

  return mapDesignToAdminDetailGql(design, productNameBySlug)
}
