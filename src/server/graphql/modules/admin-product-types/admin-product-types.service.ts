import { Prisma, ProductStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { deriveSiblingImageKeysFromWebpPublicId, r2DeleteObject } from '@/src/server/storage/r2'

import type { GraphQLContext } from '../../context'

import { requireAdminGraphQL } from '../admin-products/admin-products.auth'
import type { AdminProductTypeGql } from '../admin-products/admin-products.types'
import { assertCanArchiveProductType } from './admin-product-types.guards'
import { mapAdminProductTypeToGql } from './admin-product-types.mappers'
import type { ProductTypeCounts } from './admin-product-types.mappers'
import {
  createAdminProductTypeInputSchema,
  parseAdminProductTypesListInput,
  productTypeIdSchema,
  updateAdminProductTypeInputSchema,
} from './admin-product-types.validation'

export type AdminProductTypesListInput = {
  includeInactive?: boolean | null
}

export type CreateAdminProductTypeInput = {
  slug: string
  shopSlug?: string | null
  nameEs: string
  nameEn?: string | null
  description?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
  showInNav?: boolean | null
}

export type UpdateAdminProductTypeInput = {
  slug?: string
  shopSlug?: string | null
  nameEs?: string
  nameEn?: string | null
  description?: string | null
  sortOrder?: number | null
  isActive?: boolean | null
  showInNav?: boolean | null
  cardImageAlt?: string | null
}

function notFoundError(entity = 'Categoría'): GraphQLError {
  return new GraphQLError(`${entity} no encontrada.`, {
    extensions: { code: 'NOT_FOUND' },
  })
}

function conflictError(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT' },
  })
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

async function loadProductTypeCounts(
  context: GraphQLContext,
  productTypeIds: string[],
): Promise<Map<string, ProductTypeCounts>> {
  const counts = new Map<string, ProductTypeCounts>()
  if (productTypeIds.length === 0) return counts

  const [totalCounts, activeCounts] = await Promise.all([
    context.prisma.product.groupBy({
      by: ['productTypeId'],
      where: {
        productTypeId: { in: productTypeIds },
        deletedAt: null,
      },
      _count: { _all: true },
    }),
    context.prisma.product.groupBy({
      by: ['productTypeId'],
      where: {
        productTypeId: { in: productTypeIds },
        status: ProductStatus.ACTIVE,
        deletedAt: null,
      },
      _count: { _all: true },
    }),
  ])

  for (const id of productTypeIds) {
    counts.set(id, { productCount: 0, activeProductCount: 0 })
  }

  for (const row of totalCounts) {
    const current = counts.get(row.productTypeId) ?? { productCount: 0, activeProductCount: 0 }
    counts.set(row.productTypeId, {
      ...current,
      productCount: row._count._all,
    })
  }

  for (const row of activeCounts) {
    const current = counts.get(row.productTypeId) ?? { productCount: 0, activeProductCount: 0 }
    counts.set(row.productTypeId, {
      ...current,
      activeProductCount: row._count._all,
    })
  }

  return counts
}

async function assertUniqueProductTypeSlug(
  context: GraphQLContext,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const existing = await context.prisma.productType.findFirst({
    where: {
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  })

  if (existing) {
    throw conflictError('Ya existe una categoría con ese slug.')
  }
}

async function assertUniqueProductTypeShopSlug(
  context: GraphQLContext,
  shopSlug: string,
  excludeId?: string,
): Promise<void> {
  const existing = await context.prisma.productType.findFirst({
    where: {
      shopSlug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  })

  if (existing) {
    throw conflictError('Ya existe una categoría con ese shopSlug.')
  }
}

/**
 * Lists product categories (ProductType) for admin management.
 */
export async function getAdminProductTypes(
  context: GraphQLContext,
  input?: AdminProductTypesListInput,
): Promise<AdminProductTypeGql[]> {
  requireAdminGraphQL(context)
  const { includeInactive } = parseAdminProductTypesListInput(input)

  const productTypes = await context.prisma.productType.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { nameEs: 'asc' }],
  })

  const counts = await loadProductTypeCounts(
    context,
    productTypes.map((type) => type.id),
  )

  return productTypes.map((type) => mapAdminProductTypeToGql(type, counts.get(type.id)))
}

/**
 * Returns a single product category by id.
 */
export async function getAdminProductTypeById(
  context: GraphQLContext,
  id: string,
): Promise<AdminProductTypeGql | null> {
  requireAdminGraphQL(context)
  const productTypeId = productTypeIdSchema.parse(id)

  const productType = await context.prisma.productType.findUnique({
    where: { id: productTypeId },
  })

  if (!productType) return null

  const counts = await loadProductTypeCounts(context, [productType.id])
  return mapAdminProductTypeToGql(productType, counts.get(productType.id))
}

/**
 * Creates a new product category (ProductType).
 */
export async function createAdminProductType(
  context: GraphQLContext,
  input: CreateAdminProductTypeInput,
): Promise<AdminProductTypeGql> {
  requireAdminGraphQL(context)
  const parsed = createAdminProductTypeInputSchema.parse(input)

  await assertUniqueProductTypeSlug(context, parsed.slug)
  if (parsed.shopSlug) {
    await assertUniqueProductTypeShopSlug(context, parsed.shopSlug)
  }

  try {
    const productType = await context.prisma.productType.create({
      data: {
        slug: parsed.slug,
        shopSlug: parsed.shopSlug ?? null,
        nameEs: parsed.nameEs,
        nameEn: parsed.nameEn ?? null,
        description: parsed.description ?? null,
        sortOrder: parsed.sortOrder ?? 0,
        isActive: parsed.isActive ?? true,
        showInNav: parsed.showInNav ?? true,
      },
    })

    return mapAdminProductTypeToGql(productType, { productCount: 0, activeProductCount: 0 })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw conflictError('Ya existe una categoría con ese slug o shopSlug.')
    }
    throw error
  }
}

/**
 * Updates an existing product category (ProductType).
 */
export async function updateAdminProductType(
  context: GraphQLContext,
  id: string,
  input: UpdateAdminProductTypeInput,
): Promise<AdminProductTypeGql> {
  requireAdminGraphQL(context)
  const productTypeId = productTypeIdSchema.parse(id)
  const parsed = updateAdminProductTypeInputSchema.parse(input)

  const existing = await context.prisma.productType.findUnique({
    where: { id: productTypeId },
  })
  if (!existing) {
    throw notFoundError()
  }

  if (parsed.slug) {
    await assertUniqueProductTypeSlug(context, parsed.slug, productTypeId)
  }

  if (parsed.shopSlug) {
    await assertUniqueProductTypeShopSlug(context, parsed.shopSlug, productTypeId)
  }

  const data: Prisma.ProductTypeUpdateInput = {}

  if (parsed.slug !== undefined) data.slug = parsed.slug
  if (parsed.shopSlug !== undefined) data.shopSlug = parsed.shopSlug
  if (parsed.nameEs !== undefined) data.nameEs = parsed.nameEs
  if (parsed.nameEn !== undefined) data.nameEn = parsed.nameEn
  if (parsed.description !== undefined) data.description = parsed.description
  if (parsed.sortOrder !== undefined && parsed.sortOrder !== null) {
    data.sortOrder = parsed.sortOrder
  }
  if (parsed.isActive !== undefined && parsed.isActive !== null) {
    data.isActive = parsed.isActive
  }
  if (parsed.showInNav !== undefined && parsed.showInNav !== null) {
    data.showInNav = parsed.showInNav
  }
  if (parsed.cardImageAlt !== undefined) {
    data.cardImageAlt = parsed.cardImageAlt
  }

  try {
    const productType = await context.prisma.productType.update({
      where: { id: productTypeId },
      data,
    })

    const counts = await loadProductTypeCounts(context, [productType.id])
    return mapAdminProductTypeToGql(productType, counts.get(productType.id))
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw conflictError('Ya existe una categoría con ese slug o shopSlug.')
    }
    throw error
  }
}

/**
 * Soft-archives a product category by setting isActive to false.
 */
export async function archiveAdminProductType(
  context: GraphQLContext,
  id: string,
): Promise<AdminProductTypeGql> {
  requireAdminGraphQL(context)
  const productTypeId = productTypeIdSchema.parse(id)

  const existing = await context.prisma.productType.findUnique({
    where: { id: productTypeId },
  })
  if (!existing) {
    throw notFoundError()
  }

  const activeProductCount = await context.prisma.product.count({
    where: {
      productTypeId,
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    },
  })

  assertCanArchiveProductType(activeProductCount)

  const productType = await context.prisma.productType.update({
    where: { id: productTypeId },
    data: {
      isActive: false,
      showInNav: false,
    },
  })

  const counts = await loadProductTypeCounts(context, [productType.id])
  return mapAdminProductTypeToGql(productType, counts.get(productType.id))
}

async function bestEffortDeleteProductTypeCardImage(
  publicId: string | null | undefined,
): Promise<void> {
  if (!publicId) return
  const keys = deriveSiblingImageKeysFromWebpPublicId(publicId)
  const targets = [keys.webp, keys.jpg, keys.thumb]
  await Promise.all(
    targets.map(async (key) => {
      try {
        await r2DeleteObject(key)
      } catch (err) {
        console.warn(`[r2] Could not delete product type card image ${key}:`, err)
      }
    }),
  )
}

/**
 * Removes the landing card image from a product category and clears stored metadata.
 */
export async function removeAdminProductTypeImage(
  context: GraphQLContext,
  id: string,
): Promise<AdminProductTypeGql> {
  requireAdminGraphQL(context)
  const productTypeId = productTypeIdSchema.parse(id)

  const existing = await context.prisma.productType.findUnique({
    where: { id: productTypeId },
  })
  if (!existing) {
    throw notFoundError()
  }

  const productType = await context.prisma.productType.update({
    where: { id: productTypeId },
    data: {
      cardImageUrl: null,
      cardImagePublicId: null,
      cardImageAlt: null,
      cardImageThumbUrl: null,
    },
  })

  void bestEffortDeleteProductTypeCardImage(existing.cardImagePublicId)

  const counts = await loadProductTypeCounts(context, [productType.id])
  return mapAdminProductTypeToGql(productType, counts.get(productType.id))
}
