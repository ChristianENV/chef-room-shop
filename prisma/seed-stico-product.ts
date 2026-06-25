import { ProductStatus, type PrismaClient } from '@prisma/client'

/** Stable slug for the STICO draft product (storefront/admin). */
export const STICO_DRAFT_PRODUCT_SLUG = 'zapato-stico-real-safety'

export const STICO_DRAFT_PRODUCT_TYPE_SLUG = 'shoes'

/** Future variant sizes (black × 22–30). Not seeded until price, SKU, and stock are confirmed. */
export const STICO_INTENDED_VARIANT_SIZE_SLUGS = [
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
] as const

export const STICO_INTENDED_COLOR_SLUG = 'black' as const

export const STICO_DRAFT_SHORT_DESCRIPTION =
  'Zapato profesional cerrado de talón con suela de caucho Nanotech + cerámica para máximo agarre. Diseñado para entornos de cocina y trabajo donde se requiere resistencia, comodidad y seguridad.'

const STICO_SPECS_LINES = [
  'Parte superior: 90% EVA ARLON CX, 10% caucho alta densidad.',
  'Plantilla: Plantilla antifatiga Hamble X.',
  'Suela: Caucho Nanotech + cerámica, máximo agarre.',
  'Antiderrapante: Grabado patentado y canaletas antiderrapantes.',
  'Rango de tallas: 220 mm - 300 mm.',
  'Peso: 680 gramos el par.',
  'Estándares indicados: KIFLT, SPIC, SATRA, OSHA, ÖNORM EN ISO 20347:2012.',
  'Resistencia nivel A: detergente, aceite y agua.',
] as const

const STICO_FEATURE_BULLETS = [
  'Diseño cerrado de talón',
  'Antiderrapante caucho + cerámica',
  'Mayor resistencia',
] as const

/**
 * Long description built only from confirmed supplier/product copy.
 */
export function buildSticoDraftDescription(): string {
  return [
    STICO_DRAFT_SHORT_DESCRIPTION,
    '',
    'Características:',
    ...STICO_FEATURE_BULLETS.map((line) => `- ${line}`),
    '',
    'Especificaciones:',
    ...STICO_SPECS_LINES,
  ].join('\n')
}

/**
 * Seeds Zapato STICO Real Safety as DRAFT without variants, images, price, SKU, or stock.
 *
 * `basePriceCents` is set to 0 because the schema requires a value and commercial price is TBD.
 */
export async function seedSticoDraftProduct(prisma: PrismaClient): Promise<void> {
  const shoesType = await prisma.productType.findUnique({
    where: { slug: STICO_DRAFT_PRODUCT_TYPE_SLUG },
  })

  if (!shoesType) {
    throw new Error(
      `ProductType "${STICO_DRAFT_PRODUCT_TYPE_SLUG}" missing — run catalog seed first`,
    )
  }

  await prisma.product.upsert({
    where: { slug: STICO_DRAFT_PRODUCT_SLUG },
    update: {
      name: 'Zapato STICO Real Safety',
      productTypeId: shoesType.id,
      shortDescription: STICO_DRAFT_SHORT_DESCRIPTION,
      description: buildSticoDraftDescription(),
      customizable: false,
      status: ProductStatus.DRAFT,
      seoTitle: 'Zapato STICO Real Safety | Chef Room',
      seoDescription: STICO_DRAFT_SHORT_DESCRIPTION,
    },
    create: {
      slug: STICO_DRAFT_PRODUCT_SLUG,
      name: 'Zapato STICO Real Safety',
      productTypeId: shoesType.id,
      shortDescription: STICO_DRAFT_SHORT_DESCRIPTION,
      description: buildSticoDraftDescription(),
      basePriceCents: 0,
      customizable: false,
      status: ProductStatus.DRAFT,
      seoTitle: 'Zapato STICO Real Safety | Chef Room',
      seoDescription: STICO_DRAFT_SHORT_DESCRIPTION,
    },
  })
}
