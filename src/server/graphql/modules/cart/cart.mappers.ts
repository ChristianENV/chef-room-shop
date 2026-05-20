import type { Design, Prisma } from '@prisma/client'

import { mapDesignToGql } from '../account/account.mappers'
import { mapProductToGql } from '../catalog/catalog.mappers'
import type {
  CartConfigSnapshotJson,
  CartCustomizationSnapshotGql,
  CartGql,
  CartItemGql,
  CartItemWithRelations,
  CartProductSnapshotGql,
  CartWithRelations,
} from './cart.types'

type DesignConfigJson = {
  productId?: string
  productSlug?: string
  finalPriceCents?: number
  areas?: string[]
  hasLogo?: boolean
  hasEmbroidery?: boolean
  embroideredName?: string
  summary?: string[]
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

function parseConfigSnapshot(value: unknown): CartConfigSnapshotJson {
  const record = parseJsonRecord(value)
  const productSnapshot = record.productSnapshot
  const customizationSnapshot = record.customizationSnapshot

  return {
    productSnapshot:
      productSnapshot && typeof productSnapshot === 'object' && !Array.isArray(productSnapshot)
        ? (productSnapshot as CartProductSnapshotGql)
        : undefined,
    customizationSnapshot:
      customizationSnapshot &&
      typeof customizationSnapshot === 'object' &&
      !Array.isArray(customizationSnapshot)
        ? (customizationSnapshot as CartCustomizationSnapshotGql)
        : undefined,
  }
}

function primaryImageUrl(
  images: { url: string; isPrimary: boolean; sortOrder: number }[],
): string | null {
  if (images.length === 0) return null
  const primary = images.find((img) => img.isPrimary)
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  return primary?.url ?? sorted[0]?.url ?? null
}

/**
 * Builds a product snapshot from loaded relations (used when persisting cart lines).
 */
export function buildProductSnapshot(
  item: CartItemWithRelations,
): CartProductSnapshotGql {
  const { product, productVariant } = item

  return {
    productId: product.id,
    variantId: productVariant?.id ?? null,
    slug: product.slug,
    name: product.name,
    sku: productVariant?.sku ?? null,
    imageUrl: primaryImageUrl(product.images),
    productType: product.productType.nameEs ?? product.productType.slug,
    colorName: productVariant?.color.name ?? null,
    colorHex: productVariant?.color.hex ?? null,
    sizeName: productVariant?.size.name ?? null,
  }
}

/**
 * Builds a customization snapshot from a design row and optional config.
 */
export function buildCustomizationSnapshot(
  design: Design | null,
  configJson?: unknown,
): CartCustomizationSnapshotGql {
  if (!design) {
    return {
      designId: null,
      previewUrl: null,
      summary: [],
      areas: [],
      hasLogo: false,
      hasEmbroidery: false,
      embroideredName: null,
    }
  }

  const config = parseJsonRecord(configJson ?? design.configJson) as DesignConfigJson
  const summary = Array.isArray(config.summary)
    ? config.summary.filter((line): line is string => typeof line === 'string')
    : design.name
      ? [design.name]
      : []

  const areas = Array.isArray(config.areas)
    ? config.areas.filter((area): area is string => typeof area === 'string')
    : []

  return {
    designId: design.id,
    previewUrl: design.previewUrl,
    summary,
    areas,
    hasLogo: Boolean(config.hasLogo),
    hasEmbroidery: Boolean(config.hasEmbroidery),
    embroideredName:
      typeof config.embroideredName === 'string' ? config.embroideredName : null,
  }
}

function resolveProductSnapshot(item: CartItemWithRelations): CartProductSnapshotGql {
  const fromConfig = parseConfigSnapshot(item.configSnapshotJson).productSnapshot
  if (fromConfig?.productId) return fromConfig
  return buildProductSnapshot(item)
}

function resolveCustomizationSnapshot(item: CartItemWithRelations): CartCustomizationSnapshotGql {
  const fromConfig = parseConfigSnapshot(item.configSnapshotJson).customizationSnapshot
  if (fromConfig) return fromConfig
  return buildCustomizationSnapshot(item.design, item.design?.configJson)
}

/**
 * Computes cart totals from line items (Cart table has no persisted cent columns).
 */
export function computeCartTotals(items: CartItemWithRelations[]): {
  subtotalCents: number
  customizationTotalCents: number
  shippingCostCents: number
  discountTotalCents: number
  totalCents: number
  totalItems: number
} {
  let subtotalCents = 0
  let customizationTotalCents = 0
  let totalItems = 0

  for (const item of items) {
    subtotalCents += item.unitPriceCents * item.quantity
    customizationTotalCents += item.customizationPriceCents * item.quantity
    totalItems += item.quantity
  }

  const shippingCostCents = 0
  const discountTotalCents = 0
  const totalCents =
    subtotalCents + customizationTotalCents + shippingCostCents - discountTotalCents

  return {
    subtotalCents,
    customizationTotalCents,
    shippingCostCents,
    discountTotalCents,
    totalCents,
    totalItems,
  }
}

/**
 * Maps a cart line item with relations to the GraphQL cart item shape.
 */
export function mapCartItemToGql(item: CartItemWithRelations): CartItemGql {
  const totalPriceCents =
    (item.unitPriceCents + item.customizationPriceCents) * item.quantity

  return {
    id: item.id,
    productId: item.productId,
    productVariantId: item.productVariantId,
    designId: item.designId,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    customizationPriceCents: item.customizationPriceCents,
    totalPriceCents,
    product: mapProductToGql(item.product),
    design: item.design ? mapDesignToGql(item.design, null) : null,
    productSnapshot: resolveProductSnapshot(item),
    customizationSnapshot: resolveCustomizationSnapshot(item),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

/**
 * Maps a Prisma cart with items to the GraphQL cart shape.
 */
export function mapCartToGql(cart: CartWithRelations): CartGql {
  const totals = computeCartTotals(cart.items)

  return {
    id: cart.id,
    status: cart.status,
    currency: cart.currency,
    ...totals,
    items: cart.items.map(mapCartItemToGql),
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  }
}

/**
 * Serializes product + customization snapshots for `configSnapshotJson`.
 */
export function toConfigSnapshotJson(
  productSnapshot: CartProductSnapshotGql,
  customizationSnapshot: CartCustomizationSnapshotGql,
): Prisma.InputJsonValue {
  return {
    productSnapshot,
    customizationSnapshot,
  } satisfies CartConfigSnapshotJson
}
