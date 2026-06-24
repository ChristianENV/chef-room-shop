import { ProductStatus, type Prisma, type PrismaClient } from '@prisma/client'

import {
  mapColorToGql,
  mapCustomizationRuleToGql,
  mapProductToGql,
  mapProductTypeToGql,
  mapSizeToGql,
} from './catalog.mappers'
import type {
  CatalogColorGql,
  CatalogProductCustomizationRuleGql,
  CatalogProductGql,
  CatalogProductTypeGql,
  CatalogSizeGql,
  GetProductsInput,
  ProductsPayloadGql,
} from './catalog.types'

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 100
const productInclude = {
  productType: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { deletedAt: null },
    include: { color: true, size: true },
    orderBy: { sku: 'asc' as const },
  },
  customizationRules: {
    where: { isEnabled: true },
    include: { area: true, option: true },
    orderBy: [{ area: { sortOrder: 'asc' } }, { option: { slug: 'asc' } }],
  },
  modelAssets: {
    where: { deletedAt: null, isActive: true },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.ProductInclude

function activeProductWhere(): Prisma.ProductWhereInput {
  return {
    status: ProductStatus.ACTIVE,
    deletedAt: null,
  }
}

function clampLimit(limit?: number | null): number {
  if (limit == null || Number.isNaN(limit)) return DEFAULT_LIMIT
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT)
}

function clampOffset(offset?: number | null): number {
  if (offset == null || Number.isNaN(offset)) return 0
  return Math.max(0, Math.floor(offset))
}

function buildProductsWhere(filter?: GetProductsInput['filter']): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = activeProductWhere()

  if (!filter) return where

  if (filter.productTypeSlug) {
    where.productType = { slug: filter.productTypeSlug }
  }

  if (filter.isCustomizable != null) {
    where.customizable = filter.isCustomizable
  }

  if (filter.search?.trim()) {
    const term = filter.search.trim()
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { shortDescription: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ]
  }

  if (filter.colorSlug || filter.sizeSlug) {
    where.variants = {
      some: {
        deletedAt: null,
        ...(filter.colorSlug ? { color: { slug: filter.colorSlug } } : {}),
        ...(filter.sizeSlug ? { size: { slug: filter.sizeSlug } } : {}),
      },
    }
  }

  return where
}

function buildProductsOrderBy(
  sort?: GetProductsInput['sort'],
): Prisma.ProductOrderByWithRelationInput[] {
  const field = sort?.field?.toLowerCase() ?? 'createdat'
  const direction = sort?.direction?.toLowerCase() === 'asc' ? 'asc' : 'desc'

  switch (field) {
    case 'name':
      return [{ name: direction }]
    case 'price':
    case 'baseprice':
    case 'basepricecents':
      return [{ basePriceCents: direction }]
    case 'createdat':
    default:
      return [{ createdAt: direction }]
  }
}

/**
 * Lists active storefront products with optional filters, sort, and pagination.
 */
export async function getProducts(
  prisma: PrismaClient,
  input: GetProductsInput = {},
): Promise<ProductsPayloadGql> {
  const limit = clampLimit(input.limit)
  const offset = clampOffset(input.offset)
  const where = buildProductsWhere(input.filter)

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: buildProductsOrderBy(input.sort),
      take: limit,
      skip: offset,
    }),
  ])

  return {
    items: rows.map(mapProductToGql),
    total,
  }
}

/**
 * Returns a single active product by slug, or null when not found.
 */
export async function getProductBySlug(
  prisma: PrismaClient,
  slug: string,
): Promise<CatalogProductGql | null> {
  const product = await prisma.product.findFirst({
    where: {
      ...activeProductWhere(),
      slug,
    },
    include: productInclude,
  })

  if (!product) return null
  return mapProductToGql(product)
}

/**
 * Returns all product types (reference data for filters).
 */
export async function getProductTypes(prisma: PrismaClient): Promise<CatalogProductTypeGql[]> {
  const rows = await prisma.productType.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map(mapProductTypeToGql)
}

/**
 * Returns all colors (reference data for filters).
 */
export async function getColors(prisma: PrismaClient): Promise<CatalogColorGql[]> {
  const rows = await prisma.color.findMany({
    orderBy: { name: 'asc' },
  })
  return rows.map(mapColorToGql)
}

/**
 * Returns all sizes (reference data for filters).
 */
export async function getSizes(prisma: PrismaClient): Promise<CatalogSizeGql[]> {
  const rows = await prisma.size.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map(mapSizeToGql)
}

/**
 * Returns enabled customization rules for a product (active, not deleted).
 */
export async function getCustomizationRulesByProduct(
  prisma: PrismaClient,
  productId: string,
): Promise<CatalogProductCustomizationRuleGql[]> {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      ...activeProductWhere(),
    },
    select: { id: true },
  })

  if (!product) return []

  const rules = await prisma.productCustomizationRule.findMany({
    where: {
      productId,
      isEnabled: true,
    },
    include: { area: true, option: true },
    orderBy: [{ area: { sortOrder: 'asc' } }, { option: { slug: 'asc' } }],
  })

  return rules.map(mapCustomizationRuleToGql)
}
