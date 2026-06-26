import { AuditAction, Prisma, ProductStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'
import type { CurrentUser } from '@/src/server/auth/types'

import { requireAdminGraphQL } from './admin-products.auth'
import {
  mapAdminColorToGql,
  mapAdminProductImageToGql,
  mapAdminProductToGql,
  mapAdminProductTypeToGql,
  mapAdminProductVariantToGql,
  mapAdminSizeToGql,
} from './admin-products.mappers'
import {
  buildVariantSkuBase,
  ensureUniqueProductSlug,
  ensureUniqueVariantSku,
  slugifyProductName,
} from './admin-products.slug'
import type {
  AdminProductFormOptionsGql,
  AdminProductGql,
  AdminProductImageGql,
  AdminProductImageInput,
  AdminProductInput,
  AdminProductVariantGql,
  AdminProductVariantInput,
  AdminProductsListInput,
  AdminProductsPayloadGql,
} from './admin-products.types'
import {
  adminProductImageInputSchema,
  reorderAdminProductImagesSchema,
  adminProductInputSchema,
  adminProductVariantInputSchema,
  parseAdminProductsListInput,
  productIdSchema,
  productSlugSchema,
  updateAdminProductStatusSchema,
  variantIdSchema,
  imageIdSchema,
} from './admin-products.validation'
import {
  assertActiveVariantsMatchProductType,
  assertVariantColorAllowedForProductType,
} from './admin-products.variant-colors'

const productInclude = {
  productType: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { deletedAt: null },
    include: { color: true, size: true },
    orderBy: { sku: 'asc' as const },
  },
  modelAssets: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.ProductInclude

function notFoundError(entity = 'Producto'): GraphQLError {
  return new GraphQLError(`${entity} no encontrado.`, {
    extensions: { code: 'NOT_FOUND' },
  })
}

function conflictError(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT' },
  })
}

async function createProductAuditLog(
  tx: Prisma.TransactionClient,
  user: CurrentUser,
  action: AuditAction,
  productId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: user.id,
      action,
      entityType: 'Product',
      entityId: productId,
      metadataJson: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  })
}

function buildListWhere(filter: AdminProductsListInput['filter']): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {}

  if (!filter?.includeArchived) {
    where.deletedAt = null
  }

  if (filter?.search?.trim()) {
    const term = filter.search.trim()
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { slug: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { shortDescription: { contains: term, mode: 'insensitive' } },
    ]
  }

  if (filter?.productTypeSlug) {
    where.productType = { slug: filter.productTypeSlug }
  }

  if (filter?.status) {
    where.status = filter.status as ProductStatus
  }

  if (filter?.customizable != null) {
    where.customizable = filter.customizable
  }

  return where
}

function buildListOrderBy(
  sort: AdminProductsListInput['sort'],
): Prisma.ProductOrderByWithRelationInput {
  const direction = sort?.direction === 'asc' ? 'asc' : 'desc'
  switch (sort?.field) {
    case 'name':
      return { name: direction }
    case 'basePriceCents':
      return { basePriceCents: direction }
    case 'status':
      return { status: direction }
    case 'createdAt':
      return { createdAt: direction }
    case 'updatedAt':
    default:
      return { updatedAt: direction }
  }
}

/**
 * Lists products for admin with filters and pagination.
 */
export async function getAdminProducts(
  context: GraphQLContext,
  input: unknown,
): Promise<AdminProductsPayloadGql> {
  requireAdminGraphQL(context)
  const parsed = parseAdminProductsListInput(input)
  const where = buildListWhere(parsed.filter)

  const [total, products] = await Promise.all([
    context.prisma.product.count({ where }),
    context.prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: buildListOrderBy(parsed.sort),
      take: parsed.limit,
      skip: parsed.offset,
    }),
  ])

  return {
    items: products.map(mapAdminProductToGql),
    total,
  }
}

/**
 * Returns a single admin product by id.
 */
export async function getAdminProductById(
  context: GraphQLContext,
  id: string,
): Promise<AdminProductGql | null> {
  requireAdminGraphQL(context)
  const productId = productIdSchema.parse(id)

  const product = await context.prisma.product.findFirst({
    where: { id: productId },
    include: productInclude,
  })

  if (!product) return null
  return mapAdminProductToGql(product)
}

/**
 * Returns a single admin product by slug.
 */
export async function getAdminProductBySlug(
  context: GraphQLContext,
  slug: string,
): Promise<AdminProductGql | null> {
  requireAdminGraphQL(context)
  const parsedSlug = productSlugSchema.parse(slug)

  const product = await context.prisma.product.findFirst({
    where: { slug: parsedSlug },
    include: productInclude,
  })

  if (!product) return null
  return mapAdminProductToGql(product)
}

/**
 * Returns lookup options for admin product forms.
 */
export async function getAdminProductFormOptions(
  context: GraphQLContext,
): Promise<AdminProductFormOptionsGql> {
  requireAdminGraphQL(context)

  const [productTypes, colors, sizes] = await Promise.all([
    context.prisma.productType.findMany({ orderBy: { sortOrder: 'asc' } }),
    context.prisma.color.findMany({ orderBy: { name: 'asc' } }),
    context.prisma.size.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return {
    productTypes: productTypes.map((productType) => mapAdminProductTypeToGql(productType)),
    colors: colors.map(mapAdminColorToGql),
    sizes: sizes.map(mapAdminSizeToGql),
  }
}

/**
 * Creates a new product (admin).
 */
export async function createAdminProduct(
  context: GraphQLContext,
  input: AdminProductInput,
): Promise<AdminProductGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = adminProductInputSchema.parse(input)

  const productType = await context.prisma.productType.findUnique({
    where: { id: parsed.productTypeId },
  })
  if (!productType) {
    throw notFoundError('Tipo de producto')
  }

  const baseSlug = slugifyProductName(parsed.slug?.trim() || parsed.name)
  const slug = await ensureUniqueProductSlug(context.prisma, baseSlug)

  const product = await context.prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        productTypeId: parsed.productTypeId,
        slug,
        name: parsed.name,
        shortDescription: parsed.shortDescription ?? null,
        description: parsed.description ?? null,
        basePriceCents: parsed.basePriceCents,
        customizable: parsed.customizable ?? true,
        status: (parsed.status as ProductStatus) ?? ProductStatus.DRAFT,
        seoTitle: parsed.seoTitle ?? null,
        seoDescription: parsed.seoDescription ?? null,
      },
      include: productInclude,
    })

    await createProductAuditLog(tx, admin, AuditAction.CREATE, created.id, {
      slug: created.slug,
      name: created.name,
    })

    return created
  })

  return mapAdminProductToGql(product)
}

/**
 * Updates an existing product (admin).
 */
export async function updateAdminProduct(
  context: GraphQLContext,
  id: string,
  input: AdminProductInput,
): Promise<AdminProductGql> {
  const admin = requireAdminGraphQL(context)
  const productId = productIdSchema.parse(id)
  const parsed = adminProductInputSchema.parse(input)

  const existing = await context.prisma.product.findUnique({
    where: { id: productId },
  })
  if (!existing) {
    throw notFoundError()
  }

  const productType = await context.prisma.productType.findUnique({
    where: { id: parsed.productTypeId },
  })
  if (!productType) {
    throw notFoundError('Tipo de producto')
  }

  if (parsed.productTypeId !== existing.productTypeId) {
    await assertActiveVariantsMatchProductType(context.prisma, productId, productType.slug)
  }

  let slug = existing.slug
  if (parsed.slug?.trim()) {
    const candidate = slugifyProductName(parsed.slug)
    slug = await ensureUniqueProductSlug(context.prisma, candidate, productId)
  } else if (parsed.name !== existing.name && !parsed.slug) {
    const candidate = slugifyProductName(parsed.name)
    if (candidate !== existing.slug) {
      slug = await ensureUniqueProductSlug(context.prisma, candidate, productId)
    }
  }

  const product = await context.prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        productTypeId: parsed.productTypeId,
        slug,
        name: parsed.name,
        shortDescription: parsed.shortDescription ?? null,
        description: parsed.description ?? null,
        basePriceCents: parsed.basePriceCents,
        customizable: parsed.customizable ?? existing.customizable,
        status: (parsed.status as ProductStatus) ?? existing.status,
        seoTitle: parsed.seoTitle ?? null,
        seoDescription: parsed.seoDescription ?? null,
      },
      include: productInclude,
    })

    await createProductAuditLog(tx, admin, AuditAction.UPDATE, updated.id, {
      slug: updated.slug,
    })

    return updated
  })

  return mapAdminProductToGql(product)
}

/**
 * Archives a product (status ARCHIVED + soft delete timestamp).
 */
export async function archiveAdminProduct(
  context: GraphQLContext,
  id: string,
): Promise<AdminProductGql> {
  const admin = requireAdminGraphQL(context)
  const productId = productIdSchema.parse(id)

  const product = await context.prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { id: productId } })
    if (!existing) {
      throw notFoundError()
    }

    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date(),
      },
      include: productInclude,
    })

    await createProductAuditLog(tx, admin, AuditAction.DELETE, updated.id, {
      action: 'archive',
    })

    return updated
  })

  return mapAdminProductToGql(product)
}

/**
 * Updates only the commercial status of a product.
 */
export async function updateAdminProductStatus(
  context: GraphQLContext,
  id: string,
  status: string,
): Promise<AdminProductGql> {
  const admin = requireAdminGraphQL(context)
  const parsed = updateAdminProductStatusSchema.parse({ id, status })

  const product = await context.prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { id: parsed.id } })
    if (!existing) {
      throw notFoundError()
    }

    const nextStatus = parsed.status as ProductStatus
    const updated = await tx.product.update({
      where: { id: parsed.id },
      data: {
        status: nextStatus,
        deletedAt:
          nextStatus === ProductStatus.ACTIVE
            ? null
            : nextStatus === ProductStatus.ARCHIVED
              ? (existing.deletedAt ?? new Date())
              : existing.deletedAt,
      },
      include: productInclude,
    })

    await createProductAuditLog(tx, admin, AuditAction.UPDATE, updated.id, {
      status: updated.status,
    })

    return updated
  })

  return mapAdminProductToGql(product)
}

/**
 * Duplicates a product with images, variants and customization rules.
 */
export async function duplicateAdminProduct(
  context: GraphQLContext,
  id: string,
): Promise<AdminProductGql> {
  const admin = requireAdminGraphQL(context)
  const productId = productIdSchema.parse(id)

  const source = await context.prisma.product.findFirst({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { deletedAt: null },
        include: { color: true, size: true },
      },
      customizationRules: true,
    },
  })

  if (!source) {
    throw notFoundError()
  }

  const copyName = `${source.name} (copia)`
  const baseSlug = slugifyProductName(`${source.slug}-copia`)

  const newProductId = await context.prisma.$transaction(async (tx) => {
    const slug = await ensureUniqueProductSlug(tx, baseSlug)

    const created = await tx.product.create({
      data: {
        productTypeId: source.productTypeId,
        slug,
        name: copyName,
        shortDescription: source.shortDescription,
        description: source.description,
        basePriceCents: source.basePriceCents,
        customizable: source.customizable,
        status: ProductStatus.DRAFT,
        seoTitle: source.seoTitle,
        seoDescription: source.seoDescription,
      },
    })

    if (source.images.length > 0) {
      await tx.productImage.createMany({
        data: source.images.map((img) => ({
          productId: created.id,
          url: img.url,
          publicId: img.publicId,
          alt: img.alt,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })),
      })
    }

    for (const variant of source.variants) {
      const skuBase = buildVariantSkuBase(created.slug, variant.color.slug, variant.size.slug)
      const sku = await ensureUniqueVariantSku(tx, skuBase)
      await tx.productVariant.create({
        data: {
          productId: created.id,
          colorId: variant.colorId,
          sizeId: variant.sizeId,
          sku,
          priceCents: variant.priceCents,
          stockQty: variant.stockQty,
        },
      })
    }

    if (source.customizationRules.length > 0) {
      await tx.productCustomizationRule.createMany({
        data: source.customizationRules.map((rule) => ({
          productId: created.id,
          areaId: rule.areaId,
          optionId: rule.optionId,
          isEnabled: rule.isEnabled,
          configJson: rule.configJson ?? undefined,
        })),
      })
    }

    await createProductAuditLog(tx, admin, AuditAction.CREATE, created.id, {
      duplicatedFrom: source.id,
    })

    return created.id
  })

  const full = await context.prisma.product.findFirst({
    where: { id: newProductId },
    include: productInclude,
  })

  if (!full) {
    throw notFoundError()
  }

  return mapAdminProductToGql(full)
}

/**
 * Creates or updates a product variant.
 */
export async function upsertAdminProductVariant(
  context: GraphQLContext,
  input: AdminProductVariantInput,
): Promise<AdminProductVariantGql> {
  requireAdminGraphQL(context)
  const parsed = adminProductVariantInputSchema.parse(input)

  const product = await context.prisma.product.findUnique({
    where: { id: parsed.productId },
    include: { productType: true },
  })
  if (!product) {
    throw notFoundError()
  }

  if (parsed.id) {
    const existing = await context.prisma.productVariant.findFirst({
      where: { id: parsed.id, productId: parsed.productId },
      include: { color: true, size: true },
    })
    if (!existing) {
      throw notFoundError('Variante')
    }

    const colorId = parsed.colorId ?? existing.colorId
    const sizeId = parsed.sizeId ?? existing.sizeId

    const color = await context.prisma.color.findUnique({ where: { id: colorId } })
    const size = await context.prisma.size.findUnique({ where: { id: sizeId } })
    if (!color || !size) {
      throw notFoundError('Color o talla')
    }

    assertVariantColorAllowedForProductType({
      productTypeSlug: product.productType.slug,
      colorSlug: color.slug,
    })

    let sku = existing.sku
    if (parsed.sku?.trim()) {
      sku = await ensureUniqueVariantSku(
        context.prisma,
        parsed.sku.trim().toUpperCase(),
        existing.id,
      )
    }

    const reactivate = parsed.isActive === true
    const variant = await context.prisma.productVariant.update({
      where: { id: existing.id },
      data: {
        colorId,
        sizeId,
        sku,
        priceCents: parsed.priceCents ?? existing.priceCents,
        stockQty: parsed.stockQty ?? existing.stockQty,
        deletedAt: reactivate ? null : parsed.isActive === false ? new Date() : existing.deletedAt,
      },
      include: { color: true, size: true },
    })

    return mapAdminProductVariantToGql(variant, product.basePriceCents, parsed.variantName)
  }

  if (!parsed.colorId || !parsed.sizeId) {
    throw new GraphQLError('colorId y sizeId son requeridos para crear una variante.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const color = await context.prisma.color.findUnique({ where: { id: parsed.colorId } })
  const size = await context.prisma.size.findUnique({ where: { id: parsed.sizeId } })
  if (!color || !size) {
    throw notFoundError('Color o talla')
  }

  assertVariantColorAllowedForProductType({
    productTypeSlug: product.productType.slug,
    colorSlug: color.slug,
  })

  const skuBase = parsed.sku?.trim()
    ? parsed.sku.trim().toUpperCase()
    : buildVariantSkuBase(product.slug, color.slug, size.slug)
  const sku = await ensureUniqueVariantSku(context.prisma, skuBase)

  try {
    const variant = await context.prisma.productVariant.create({
      data: {
        productId: parsed.productId,
        colorId: parsed.colorId,
        sizeId: parsed.sizeId,
        sku,
        priceCents: parsed.priceCents ?? product.basePriceCents,
        stockQty: parsed.stockQty ?? 0,
      },
      include: { color: true, size: true },
    })

    return mapAdminProductVariantToGql(variant, product.basePriceCents, parsed.variantName)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflictError('Ya existe una variante con este color y talla.')
    }
    throw error
  }
}

/**
 * Soft-deletes a product variant (preserves order history references).
 */
export async function deleteAdminProductVariant(
  context: GraphQLContext,
  id: string,
): Promise<boolean> {
  requireAdminGraphQL(context)
  const variantId = variantIdSchema.parse(id)

  const variant = await context.prisma.productVariant.findUnique({
    where: { id: variantId },
  })
  if (!variant) {
    throw notFoundError('Variante')
  }

  await context.prisma.productVariant.update({
    where: { id: variantId },
    data: { deletedAt: new Date() },
  })

  return true
}

/**
 * Creates or updates a product image (URL placeholder, no Cloudinary upload).
 */
export async function upsertAdminProductImage(
  context: GraphQLContext,
  input: AdminProductImageInput,
): Promise<AdminProductImageGql> {
  requireAdminGraphQL(context)
  const parsed = adminProductImageInputSchema.parse(input)

  const product = await context.prisma.product.findUnique({
    where: { id: parsed.productId },
  })
  if (!product) {
    throw notFoundError()
  }

  const image = await context.prisma.$transaction(async (tx) => {
    if (parsed.isPrimary) {
      await tx.productImage.updateMany({
        where: { productId: parsed.productId },
        data: { isPrimary: false },
      })
    }

    if (parsed.id) {
      const existing = await tx.productImage.findFirst({
        where: { id: parsed.id, productId: parsed.productId },
      })
      if (!existing) {
        throw notFoundError('Imagen')
      }

      return tx.productImage.update({
        where: { id: parsed.id },
        data: {
          url: parsed.url,
          publicId: parsed.publicId ?? null,
          alt: parsed.alt ?? null,
          sortOrder: parsed.sortOrder ?? existing.sortOrder,
          isPrimary: parsed.isPrimary ?? existing.isPrimary,
        },
      })
    }

    const hasPrimary = await tx.productImage.findFirst({
      where: { productId: parsed.productId, isPrimary: true },
    })

    return tx.productImage.create({
      data: {
        productId: parsed.productId,
        url: parsed.url,
        publicId: parsed.publicId ?? null,
        alt: parsed.alt ?? null,
        sortOrder: parsed.sortOrder ?? 0,
        isPrimary: parsed.isPrimary ?? !hasPrimary,
      },
    })
  })

  return mapAdminProductImageToGql(image)
}

/**
 * Deletes a product image and reassigns primary if needed.
 */
export async function deleteAdminProductImage(
  context: GraphQLContext,
  id: string,
): Promise<boolean> {
  requireAdminGraphQL(context)
  const imageId = imageIdSchema.parse(id)

  const image = await context.prisma.productImage.findUnique({
    where: { id: imageId },
  })
  if (!image) {
    throw notFoundError('Imagen')
  }

  await context.prisma.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: imageId } })

    if (image.isPrimary) {
      const next = await tx.productImage.findFirst({
        where: { productId: image.productId },
        orderBy: { sortOrder: 'asc' },
      })
      if (next) {
        await tx.productImage.update({
          where: { id: next.id },
          data: { isPrimary: true },
        })
      }
    }
  })

  return true
}

/**
 * Reorders product images and sets the first as primary.
 */
export async function reorderAdminProductImages(
  context: GraphQLContext,
  productId: string,
  imageIds: string[],
): Promise<AdminProductImageGql[]> {
  requireAdminGraphQL(context)
  const parsed = reorderAdminProductImagesSchema.parse({ productId, imageIds })

  const product = await context.prisma.product.findUnique({
    where: { id: parsed.productId },
    select: { id: true },
  })
  if (!product) {
    throw notFoundError()
  }

  const existing = await context.prisma.productImage.findMany({
    where: { productId: parsed.productId },
    select: { id: true },
  })

  const existingIds = new Set(existing.map((img) => img.id))
  if (existing.length !== parsed.imageIds.length) {
    throw new GraphQLError('La lista de imágenes no coincide con el producto.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  for (const id of parsed.imageIds) {
    if (!existingIds.has(id)) {
      throw new GraphQLError('Una o más imágenes no pertenecen a este producto.', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }
  }

  await context.prisma.$transaction(async (tx) => {
    await tx.productImage.updateMany({
      where: { productId: parsed.productId },
      data: { isPrimary: false },
    })

    for (let index = 0; index < parsed.imageIds.length; index++) {
      const id = parsed.imageIds[index]!
      await tx.productImage.update({
        where: { id },
        data: {
          sortOrder: index,
          isPrimary: index === 0,
        },
      })
    }
  })

  const images = await context.prisma.productImage.findMany({
    where: { productId: parsed.productId },
    orderBy: { sortOrder: 'asc' },
  })

  return images.map(mapAdminProductImageToGql)
}
