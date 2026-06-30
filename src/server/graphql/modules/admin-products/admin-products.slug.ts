type PrismaClientLike = {
  product: {
    findFirst: (args: {
      where: { slug: string; id?: { not: string } }
      select: { id: true }
    }) => Promise<{ id: string } | null>
  }
  productVariant: {
    findFirst: (args: {
      where: { sku: string; id?: { not: string } }
      select: { id: true }
    }) => Promise<{ id: string } | null>
  }
}

/**
 * Converts a product display name into a URL-safe slug segment.
 */
export function slugifyProductName(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return slug.length > 0 ? slug : 'producto'
}

/**
 * Returns a product slug that does not collide with existing rows (any status/archive).
 */
export async function ensureUniqueProductSlug(
  prisma: PrismaClientLike,
  baseSlug: string,
  excludeProductId?: string,
): Promise<string> {
  const root = baseSlug.trim() || 'producto'
  let candidate = root
  let suffix = 2

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${root}-${suffix}`
    suffix += 1
  }
}

/**
 * Builds a default SKU from product slug and variant attributes.
 */
export function buildVariantSkuBase(
  productSlug: string,
  colorSlug: string,
  sizeSlug: string,
): string {
  const parts = [productSlug, colorSlug, sizeSlug].map((p) =>
    p.toUpperCase().replace(/[^A-Z0-9]/g, ''),
  )
  return ['CR', ...parts.filter(Boolean)].join('-').slice(0, 80)
}

/**
 * Returns a variant SKU that does not collide with existing rows.
 */
export async function ensureUniqueVariantSku(
  prisma: PrismaClientLike,
  baseSku: string,
  excludeVariantId?: string,
): Promise<string> {
  const root = baseSku.trim().toUpperCase() || 'CR-VAR'
  let candidate = root
  let suffix = 2

  while (true) {
    const existing = await prisma.productVariant.findFirst({
      where: {
        sku: candidate,
        ...(excludeVariantId ? { id: { not: excludeVariantId } } : {}),
      },
      select: { id: true },
    })
    if (!existing) return candidate
    candidate = `${root}-${suffix}`
    suffix += 1
  }
}
