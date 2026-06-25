import { ProductStatus, type Prisma, type PrismaClient } from '@prisma/client'

import { getOrThrow } from './seed-helpers'
import { CANONICAL_PRODUCTS, type CanonicalProductSeed } from './seed-canonical-products.data'

export { CANONICAL_PRODUCTS, CANONICAL_PRODUCT_SLUGS } from './seed-canonical-products.data'

/**
 * Seeds production-safe canonical catalog products (idempotent upserts).
 */
export async function seedCanonicalProducts(prisma: PrismaClient): Promise<void> {
  const typeIds = new Map<string, string>()
  for (const typeSlug of ['chef-jacket', 'apron', 'pants', 'shoes'] as const) {
    const row = await prisma.productType.findUnique({ where: { slug: typeSlug } })
    if (!row) {
      throw new Error(`ProductType "${typeSlug}" missing — run catalog reference seed first`)
    }
    typeIds.set(typeSlug, row.id)
  }

  const colorIds = new Map<string, string>()
  for (const colorSlug of ['chef-blue', 'white', 'black', 'warm-gray'] as const) {
    const row = await prisma.color.findUnique({ where: { slug: colorSlug } })
    if (!row) {
      throw new Error(`Color "${colorSlug}" missing — run catalog reference seed first`)
    }
    colorIds.set(colorSlug, row.id)
  }

  const sizeIds = new Map<string, string>()
  const sizes = await prisma.size.findMany()
  for (const size of sizes) {
    sizeIds.set(size.slug, size.id)
  }

  const areaIds = new Map<string, string>()
  const optionIds = new Map<string, string>()

  for (const product of CANONICAL_PRODUCTS) {
    for (const rule of product.customizationRules) {
      if (!areaIds.has(rule.areaSlug)) {
        const row = await prisma.customizationArea.findUnique({
          where: { slug: rule.areaSlug },
        })
        areaIds.set(rule.areaSlug, getOrThrow(row?.id, `area ${rule.areaSlug}`))
      }
      if (!optionIds.has(rule.optionSlug)) {
        const row = await prisma.customizationOption.findUnique({
          where: { slug: rule.optionSlug },
        })
        optionIds.set(rule.optionSlug, getOrThrow(row?.id, `option ${rule.optionSlug}`))
      }
    }
  }

  for (const product of CANONICAL_PRODUCTS) {
    await upsertCanonicalProduct(prisma, product, typeIds, colorIds, sizeIds, areaIds, optionIds)
  }
}

async function upsertCanonicalProduct(
  prisma: PrismaClient,
  product: CanonicalProductSeed,
  typeIds: Map<string, string>,
  colorIds: Map<string, string>,
  sizeIds: Map<string, string>,
  areaIds: Map<string, string>,
  optionIds: Map<string, string>,
): Promise<void> {
  const dbProduct = await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      name: product.name,
      productTypeId: getOrThrow(typeIds.get(product.typeSlug), 'product type'),
      shortDescription: product.shortDescription,
      description: product.description,
      basePriceCents: product.basePriceCents,
      customizable: product.customizable,
      status: product.status,
      deletedAt: null,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
    },
    create: {
      slug: product.slug,
      name: product.name,
      productTypeId: getOrThrow(typeIds.get(product.typeSlug), 'product type'),
      shortDescription: product.shortDescription,
      description: product.description,
      basePriceCents: product.basePriceCents,
      customizable: product.customizable,
      status: product.status,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
    },
  })

  for (const image of product.images) {
    const existing = image.publicId
      ? await prisma.productImage.findFirst({
          where: { productId: dbProduct.id, publicId: image.publicId },
        })
      : await prisma.productImage.findFirst({
          where: { productId: dbProduct.id, sortOrder: image.sortOrder },
        })

    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: {
          url: image.url,
          publicId: image.publicId,
          alt: image.alt,
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        },
      })
    } else {
      await prisma.productImage.create({
        data: {
          productId: dbProduct.id,
          url: image.url,
          publicId: image.publicId,
          alt: image.alt,
          sortOrder: image.sortOrder,
          isPrimary: image.isPrimary,
        },
      })
    }
  }

  for (const variant of product.variants) {
    await prisma.productVariant.upsert({
      where: { sku: variant.sku },
      update: {
        productId: dbProduct.id,
        colorId: getOrThrow(colorIds.get(variant.colorSlug), `color ${variant.colorSlug}`),
        sizeId: getOrThrow(sizeIds.get(variant.sizeSlug), `size ${variant.sizeSlug}`),
        stockQty: variant.stockQty,
        priceCents: variant.priceCents,
        deletedAt: null,
      },
      create: {
        productId: dbProduct.id,
        colorId: getOrThrow(colorIds.get(variant.colorSlug), `color ${variant.colorSlug}`),
        sizeId: getOrThrow(sizeIds.get(variant.sizeSlug), `size ${variant.sizeSlug}`),
        sku: variant.sku,
        stockQty: variant.stockQty,
        priceCents: variant.priceCents,
      },
    })
  }

  for (const rule of product.customizationRules) {
    const configJson = rule.configJson as Prisma.InputJsonValue
    await prisma.productCustomizationRule.upsert({
      where: {
        productId_areaId_optionId: {
          productId: dbProduct.id,
          areaId: getOrThrow(areaIds.get(rule.areaSlug), `area ${rule.areaSlug}`),
          optionId: getOrThrow(optionIds.get(rule.optionSlug), `option ${rule.optionSlug}`),
        },
      },
      update: { isEnabled: rule.isEnabled, configJson },
      create: {
        productId: dbProduct.id,
        areaId: getOrThrow(areaIds.get(rule.areaSlug), `area ${rule.areaSlug}`),
        optionId: getOrThrow(optionIds.get(rule.optionSlug), `option ${rule.optionSlug}`),
        isEnabled: rule.isEnabled,
        configJson,
      },
    })
  }
}
