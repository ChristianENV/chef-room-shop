import { PrismaClient, ProductStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'

import { buildSku, cents, getOrThrow } from '../seed-helpers'
import { DEMO_PRODUCT_SLUG_PREFIX, PLACEHOLDER_IMAGE_BASE } from './constants'

type ProductSeed = {
  slug: string
  name: string
  typeSlug: 'chef-jacket' | 'apron' | 'pants'
  shortDescription: string
  description: string
  basePriceCents: number
  customizable: boolean
  seoTitle: string
  seoDescription: string
  imageAlt: string
}

const PRODUCTS: ProductSeed[] = [
  {
    slug: 'filipina-executive-blanca',
    name: 'Filipina Executive Blanca',
    typeSlug: 'chef-jacket',
    shortDescription: 'Filipina premium en algodón con acabado ejecutivo.',
    description:
      'Filipina de alta calidad para chef ejecutivo. Corte clásico, botones reforzados y tela transpirable.',
    basePriceCents: cents(1499),
    customizable: true,
    seoTitle: 'Filipina Executive Blanca | Chef Room',
    seoDescription: 'Uniforme de chef premium color blanco.',
    imageAlt: 'Filipina executive blanca',
  },
  {
    slug: 'filipina-azul-chef-room',
    name: 'Filipina Azul Chef Room',
    typeSlug: 'chef-jacket',
    shortDescription: 'Filipina insignia en azul corporativo Chef Room.',
    description: 'Filipina con branding Chef Room, ideal para equipos de cocina profesional.',
    basePriceCents: cents(1299),
    customizable: true,
    seoTitle: 'Filipina Azul Chef Room',
    seoDescription: 'Filipina azul corporativa personalizable.',
    imageAlt: 'Filipina azul Chef Room',
  },
  {
    slug: 'filipina-clasica-negra',
    name: 'Filipina Clásica Negra',
    typeSlug: 'chef-jacket',
    shortDescription: 'Filipina negra atemporal para cocina profesional.',
    description: 'Diseño clásico negro, resistente a manchas y fácil de planchar.',
    basePriceCents: cents(1199),
    customizable: true,
    seoTitle: 'Filipina Clásica Negra',
    seoDescription: 'Filipina negra clásica para chefs.',
    imageAlt: 'Filipina clásica negra',
  },
  {
    slug: 'filipina-manga-corta-premium',
    name: 'Filipina Manga Corta Premium',
    typeSlug: 'chef-jacket',
    shortDescription: 'Filipina manga corta para cocinas de alto ritmo.',
    description: 'Mayor ventilación con el mismo acabado premium Chef Room.',
    basePriceCents: cents(1699),
    customizable: true,
    seoTitle: 'Filipina Manga Corta Premium',
    seoDescription: 'Filipina manga corta personalizable.',
    imageAlt: 'Filipina manga corta premium',
  },
  {
    slug: 'mandil-profesional-chef',
    name: 'Mandil Profesional Chef',
    typeSlug: 'apron',
    shortDescription: 'Mandil resistente con bolsillos funcionales.',
    description: 'Mandil profesional para uso diario en cocina caliente.',
    basePriceCents: cents(899),
    customizable: true,
    seoTitle: 'Mandil Profesional Chef',
    seoDescription: 'Mandil de chef personalizable.',
    imageAlt: 'Mandil profesional chef',
  },
  {
    slug: 'mandil-denim-ejecutivo',
    name: 'Mandil Denim Ejecutivo',
    typeSlug: 'apron',
    shortDescription: 'Mandil denim para servicio y cocina abierta.',
    description: 'Estilo ejecutivo en denim premium con herrajes reforzados.',
    basePriceCents: cents(599),
    customizable: true,
    seoTitle: 'Mandil Denim Ejecutivo',
    seoDescription: 'Mandil denim ejecutivo.',
    imageAlt: 'Mandil denim ejecutivo',
  },
  {
    slug: 'pantalon-chef-comfort-negro',
    name: 'Pantalón Chef Comfort Negro',
    typeSlug: 'pants',
    shortDescription: 'Pantalón cómodo con stretch para jornadas largas.',
    description: 'Corte comfort, tela stretch y cintura ajustable.',
    basePriceCents: cents(999),
    customizable: false,
    seoTitle: 'Pantalón Chef Comfort Negro',
    seoDescription: 'Pantalón de chef negro comfort.',
    imageAlt: 'Pantalón chef comfort negro',
  },
  {
    slug: 'pantalon-chef-slim-gris',
    name: 'Pantalón Chef Slim Gris',
    typeSlug: 'pants',
    shortDescription: 'Pantalón slim fit en gris profesional.',
    description: 'Silueta slim moderna para brigadas de sala y cocina.',
    basePriceCents: cents(699),
    customizable: false,
    seoTitle: 'Pantalón Chef Slim Gris',
    seoDescription: 'Pantalón slim gris para chef.',
    imageAlt: 'Pantalón chef slim gris',
  },
]

const RULE_SPECS: {
  areaSlug: string
  optionSlug: string
  priceCents: number
  maxWidthCm: number
  maxHeightCm: number
}[] = [
  { areaSlug: 'chest', optionSlug: 'logo', priceCents: 24900, maxWidthCm: 8, maxHeightCm: 8 },
  { areaSlug: 'chest', optionSlug: 'text', priceCents: 14900, maxWidthCm: 8, maxHeightCm: 8 },
  { areaSlug: 'back', optionSlug: 'logo', priceCents: 34900, maxWidthCm: 20, maxHeightCm: 20 },
  {
    areaSlug: 'left-sleeve',
    optionSlug: 'embroidery',
    priceCents: 19900,
    maxWidthCm: 6,
    maxHeightCm: 6,
  },
  {
    areaSlug: 'right-sleeve',
    optionSlug: 'embroidery',
    priceCents: 19900,
    maxWidthCm: 6,
    maxHeightCm: 6,
  },
  { areaSlug: 'pocket', optionSlug: 'patch', priceCents: 17900, maxWidthCm: 7, maxHeightCm: 7 },
]

const VARIANT_SIZE_SLUGS = ['s', 'm', 'l'] as const
const VARIANT_COLOR_SLUGS = ['white', 'chef-blue', 'black', 'warm-gray'] as const

export type SeededCatalogResult = {
  products: number
  variants: number
  rules: number
  productIdsBySlug: Map<string, string>
  variantIdsBySku: Map<string, string>
}

/**
 * Seeds demo products, images, variants, and customization rules.
 */
export async function seedDemoCatalog(prisma: PrismaClient): Promise<SeededCatalogResult> {
  const productIdsBySlug = new Map<string, string>()
  const variantIdsBySku = new Map<string, string>()
  let variantCount = 0
  let ruleCount = 0

  const typeIds = new Map<string, string>()
  for (const typeSlug of ['chef-jacket', 'apron', 'pants'] as const) {
    const row = await prisma.productType.findUniqueOrThrow({
      where: { slug: typeSlug },
    })
    typeIds.set(typeSlug, row.id)
  }

  const colorIds = new Map<string, string>()
  for (const colorSlug of VARIANT_COLOR_SLUGS) {
    const row = await prisma.color.findUniqueOrThrow({ where: { slug: colorSlug } })
    colorIds.set(colorSlug, row.id)
  }

  const sizeIds = new Map<string, string>()
  for (const sizeSlug of VARIANT_SIZE_SLUGS) {
    const row = await prisma.size.findUniqueOrThrow({ where: { slug: sizeSlug } })
    sizeIds.set(sizeSlug, row.id)
  }

  const areaIds = new Map<string, string>()
  for (const area of RULE_SPECS) {
    if (!areaIds.has(area.areaSlug)) {
      const row = await prisma.customizationArea.findUniqueOrThrow({
        where: { slug: area.areaSlug },
      })
      areaIds.set(area.areaSlug, row.id)
    }
  }

  const optionIds = new Map<string, string>()
  for (const rule of RULE_SPECS) {
    if (!optionIds.has(rule.optionSlug)) {
      const row = await prisma.customizationOption.findUniqueOrThrow({
        where: { slug: rule.optionSlug },
      })
      optionIds.set(rule.optionSlug, row.id)
    }
  }

  for (const product of PRODUCTS) {
    const fullSlug = `${DEMO_PRODUCT_SLUG_PREFIX}${product.slug}`
    const productCode = product.slug.split('-')[0]!.slice(0, 3).toUpperCase()

    const dbProduct = await prisma.product.upsert({
      where: { slug: fullSlug },
      update: {
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        basePriceCents: product.basePriceCents,
        customizable: product.customizable,
        status: ProductStatus.ACTIVE,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
      },
      create: {
        slug: fullSlug,
        name: product.name,
        productTypeId: getOrThrow(typeIds.get(product.typeSlug), 'product type'),
        shortDescription: product.shortDescription,
        description: product.description,
        basePriceCents: product.basePriceCents,
        customizable: product.customizable,
        status: ProductStatus.ACTIVE,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
      },
    })

    productIdsBySlug.set(fullSlug, dbProduct.id)

    const imageUrl = `${PLACEHOLDER_IMAGE_BASE}&text=${encodeURIComponent(product.name)}`
    const primaryImage = await prisma.productImage.findFirst({
      where: { productId: dbProduct.id, isPrimary: true },
    })
    if (primaryImage) {
      await prisma.productImage.update({
        where: { id: primaryImage.id },
        data: {
          url: imageUrl,
          publicId: `demo/products/${product.slug}`,
          alt: product.imageAlt,
        },
      })
    } else {
      await prisma.productImage.create({
        data: {
          productId: dbProduct.id,
          url: imageUrl,
          publicId: `demo/products/${product.slug}`,
          alt: product.imageAlt,
          isPrimary: true,
          sortOrder: 0,
        },
      })
    }

    const colorsForProduct =
      product.typeSlug === 'pants'
        ? (['black', 'warm-gray'] as const)
        : (['white', 'chef-blue'] as const)

    for (const colorSlug of colorsForProduct) {
      for (const sizeSlug of VARIANT_SIZE_SLUGS) {
        const sku = buildSku([productCode, colorSlug, sizeSlug])
        const priceModifier = sizeSlug === 'l' ? 5000 : sizeSlug === 's' ? -2000 : 0

        const variant = await prisma.productVariant.upsert({
          where: { sku },
          update: {
            stockQty: 25,
            priceCents: product.basePriceCents + priceModifier,
          },
          create: {
            productId: dbProduct.id,
            colorId: getOrThrow(colorIds.get(colorSlug), 'color'),
            sizeId: getOrThrow(sizeIds.get(sizeSlug), 'size'),
            sku,
            stockQty: 25,
            priceCents: product.basePriceCents + priceModifier,
          },
        })
        variantIdsBySku.set(sku, variant.id)
        variantCount += 1
      }
    }

    if (product.customizable) {
      for (const rule of RULE_SPECS) {
        const configJson: Prisma.InputJsonValue = {
          priceCents: rule.priceCents,
          maxDimensionsCm: { width: rule.maxWidthCm, height: rule.maxHeightCm },
          allowedFileTypes: ['png', 'jpg', 'svg'],
        }

        await prisma.productCustomizationRule.upsert({
          where: {
            productId_areaId_optionId: {
              productId: dbProduct.id,
              areaId: getOrThrow(areaIds.get(rule.areaSlug), 'area'),
              optionId: getOrThrow(optionIds.get(rule.optionSlug), 'option'),
            },
          },
          update: { isEnabled: true, configJson },
          create: {
            productId: dbProduct.id,
            areaId: getOrThrow(areaIds.get(rule.areaSlug), 'area'),
            optionId: getOrThrow(optionIds.get(rule.optionSlug), 'option'),
            isEnabled: true,
            configJson,
          },
        })
        ruleCount += 1
      }
    }
  }

  return {
    products: PRODUCTS.length,
    variants: variantCount,
    rules: ruleCount,
    productIdsBySlug,
    variantIdsBySku,
  }
}
