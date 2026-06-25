/**
 * Export full canonical active product rows for production seed authoring.
 */
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

import { ProductStatus } from '@prisma/client'

import { createPrismaClient } from '../../src/server/db/create-prisma'

const prisma = createPrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    },
    include: {
      productType: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { deletedAt: null },
        include: { color: true, size: true },
        orderBy: { sku: 'asc' },
      },
      customizationRules: {
        include: { area: true, option: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const payload = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    status: product.status,
    basePriceCents: product.basePriceCents,
    customizable: product.customizable,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    productType: {
      slug: product.productType.slug,
      nameEs: product.productType.nameEs,
    },
    images: product.images.map((image) => ({
      url: image.url,
      publicId: image.publicId,
      alt: image.alt,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
    })),
    variants: product.variants.map((variant) => ({
      sku: variant.sku,
      stockQty: variant.stockQty,
      priceCents: variant.priceCents,
      colorSlug: variant.color.slug,
      sizeSlug: variant.size.slug,
    })),
    customizationRules: product.customizationRules.map((rule) => ({
      areaSlug: rule.area.slug,
      optionSlug: rule.option.slug,
      isEnabled: rule.isEnabled,
      configJson: rule.configJson,
    })),
  }))

  console.log(JSON.stringify(payload, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
