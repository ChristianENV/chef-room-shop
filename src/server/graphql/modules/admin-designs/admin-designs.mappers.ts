import type { Design, Prisma, User } from '@prisma/client'

import { extractSelectionFromConfigJson } from '@/src/lib/customization/build-customization-snapshot'

import type {
  AdminDesignCustomizationElementGql,
  AdminDesignCustomizationSummaryGql,
  AdminDesignDetailGql,
  AdminDesignListItemGql,
  AdminDesignOwnerType,
} from './admin-designs.types'

type DesignConfig = {
  productSlug?: string
  productName?: string
  finalPriceCents?: number
  pricing?: {
    totalPriceCents?: number
  }
  currency?: string
}

export type DesignWithRelations = Design & {
  user: Pick<User, 'name' | 'firstName' | 'lastName' | 'email'> | null
  orderItems: Array<{
    order: { orderNumber: string; deletedAt: Date | null }
  }>
  cartItems: Array<{
    cart: { id: string; status: string; deletedAt: Date | null }
  }>
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function parseString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function toDesignShortId(designId: string): string {
  return designId.replace(/-/g, '').slice(0, 8).toUpperCase()
}

function resolveCustomerName(user: DesignWithRelations['user']): string | null {
  if (!user) return null
  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (fromParts) return fromParts
  return user.name?.trim() || null
}

function resolveOwnerType(design: Design): AdminDesignOwnerType {
  return design.userId ? 'USER' : 'GUEST'
}

export function resolveDesignFinalPriceCents(configJson: unknown): number | null {
  const config = parseJsonRecord(configJson) as DesignConfig
  if (typeof config.finalPriceCents === 'number' && Number.isFinite(config.finalPriceCents)) {
    return config.finalPriceCents
  }
  const total = config.pricing?.totalPriceCents
  if (typeof total === 'number' && Number.isFinite(total)) {
    return total
  }
  return null
}

function resolveProductName(
  configJson: unknown,
  productNameBySlug: Map<string, string>,
): { productName: string; productSlug: string | null } {
  const config = parseJsonRecord(configJson) as DesignConfig
  const slug = config.productSlug?.trim() || null
  const fromConfigName = config.productName?.trim()
  if (fromConfigName) {
    return { productName: fromConfigName, productSlug: slug }
  }
  if (slug && productNameBySlug.has(slug)) {
    return { productName: productNameBySlug.get(slug) as string, productSlug: slug }
  }
  return { productName: slug ?? 'Producto', productSlug: slug }
}

function resolveRelatedOrderNumber(design: DesignWithRelations): string | null {
  for (const item of design.orderItems) {
    if (!item.order.deletedAt) {
      return item.order.orderNumber
    }
  }
  return null
}

function resolveRelatedCart(design: DesignWithRelations): {
  relatedCartId: string | null
  relatedCartStatus: string | null
} {
  for (const item of design.cartItems) {
    if (!item.cart.deletedAt) {
      return {
        relatedCartId: item.cart.id,
        relatedCartStatus: item.cart.status,
      }
    }
  }
  return { relatedCartId: null, relatedCartStatus: null }
}

function formatColorLabel(name: string | null, hex: string | null): string | null {
  if (name && hex) return `${name} (${hex})`
  return name ?? hex
}

function buildSummaryLines(configJson: unknown, elements: Array<Record<string, unknown>>): string[] {
  const config = parseJsonRecord(configJson)
  const fromConfig = Array.isArray(config.summary)
    ? config.summary.filter((line): line is string => typeof line === 'string' && line.trim().length > 0)
    : []

  if (fromConfig.length > 0) return fromConfig

  return elements
    .map((element) => parseString(element.text))
    .filter((text): text is string => Boolean(text))
}

function mapElements(elements: Array<Record<string, unknown>>): AdminDesignCustomizationElementGql[] {
  return elements.map((element, index) => ({
    id: parseString(element.id) ?? `element-${index}`,
    type: parseString(element.type) ?? 'personalización',
    name: parseString(element.name),
    text: parseString(element.text),
    zone: parseString(element.zone),
  }))
}

/**
 * Builds a readable customization summary from Design.configJson.
 */
export function buildAdminDesignCustomizationSummary(
  configJson: unknown,
): AdminDesignCustomizationSummaryGql {
  const selection = extractSelectionFromConfigJson(configJson)
  const elements = selection.elements

  const size =
    selection.selectedSize.label ??
    selection.selectedSize.name ??
    parseString(selection.selectedOptions.size) ??
    null

  const fabricName = selection.fabricColor.name
  const fabricHex = selection.fabricColor.hex
  const detailName = selection.detailColor.name
  const detailHex = selection.detailColor.hex

  return {
    size,
    fabricColor: formatColorLabel(fabricName, fabricHex),
    fabricColorHex: fabricHex,
    detailColor: formatColorLabel(detailName, detailHex),
    detailColorHex: detailHex,
    summaryLines: buildSummaryLines(configJson, elements),
    elements: mapElements(elements),
    previewBackUrl: selection.previewBackUrl,
  }
}

function mapDesignBaseFields(
  design: DesignWithRelations,
  productNameBySlug: Map<string, string>,
): AdminDesignListItemGql {
  const ownerType = resolveOwnerType(design)
  const { productName, productSlug } = resolveProductName(design.configJson, productNameBySlug)
  const config = parseJsonRecord(design.configJson) as DesignConfig
  const { relatedCartId, relatedCartStatus } = resolveRelatedCart(design)

  return {
    id: design.id,
    shortId: toDesignShortId(design.id),
    name: design.name,
    previewUrl: design.previewUrl,
    productName,
    productSlug,
    ownerType,
    customerName: ownerType === 'USER' ? resolveCustomerName(design.user) : null,
    customerEmail: ownerType === 'USER' ? design.user?.email ?? null : null,
    status: design.status,
    finalPriceCents: resolveDesignFinalPriceCents(design.configJson),
    currency: config.currency?.trim() || 'MXN',
    createdAt: design.createdAt.toISOString(),
    updatedAt: design.updatedAt.toISOString(),
    relatedOrderNumber: resolveRelatedOrderNumber(design),
    relatedCartId,
    relatedCartStatus,
  }
}

/**
 * Maps a Prisma design row to a safe admin list item (no configJson).
 */
export function mapDesignToAdminListItemGql(
  design: DesignWithRelations,
  productNameBySlug: Map<string, string>,
): AdminDesignListItemGql {
  return mapDesignBaseFields(design, productNameBySlug)
}

/**
 * Maps a Prisma design row to admin detail (includes configJson for audit).
 */
export function mapDesignToAdminDetailGql(
  design: DesignWithRelations,
  productNameBySlug: Map<string, string>,
): AdminDesignDetailGql {
  return {
    ...mapDesignBaseFields(design, productNameBySlug),
    customizationSummary: buildAdminDesignCustomizationSummary(design.configJson),
    configJson: design.configJson,
  }
}

export async function loadProductNameBySlugMap(
  prisma: Prisma.TransactionClient | { product: Prisma.DefaultPrismaClient['product'] },
  slugs: Iterable<string>,
): Promise<Map<string, string>> {
  const unique = [...new Set([...slugs].filter(Boolean))]
  if (unique.length === 0) return new Map()

  const products = await prisma.product.findMany({
    where: { slug: { in: unique }, deletedAt: null },
    select: { slug: true, name: true },
  })

  return new Map(products.map((product) => [product.slug, product.name]))
}

export function collectProductSlugsFromDesigns(designs: Design[]): string[] {
  const slugs = new Set<string>()
  for (const design of designs) {
    const config = parseJsonRecord(design.configJson) as DesignConfig
    const slug = config.productSlug?.trim()
    if (slug) slugs.add(slug)
  }
  return [...slugs]
}
