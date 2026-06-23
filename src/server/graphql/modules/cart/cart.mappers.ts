import type { Design, Prisma } from '@prisma/client'

import {
  buildCustomizationSnapshot as buildSharedCustomizationSnapshot,
  enrichProductSnapshotWithConfig,
} from '@/src/lib/customization/build-customization-snapshot'

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
  configJson?: unknown,
): CartProductSnapshotGql {
  const { product, productVariant } = item

  const snapshot: CartProductSnapshotGql = {
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

  const config = configJson ?? item.design?.configJson
  if (!config) return snapshot

  return enrichProductSnapshotWithConfig(snapshot, config) as CartProductSnapshotGql
}

/**
 * Builds a customization snapshot from a design row and optional config.
 */
export function buildCustomizationSnapshot(
  design: Design | null,
  configJson?: unknown,
  options?: {
    variant?: CartItemWithRelations['productVariant']
    customizationPriceCents?: number | null
  },
): CartCustomizationSnapshotGql {
  if (!design) {
    return {
      designId: null,
      previewUrl: null,
      previewBackUrl: null,
      selectedVariantId: null,
      selectedSize: { id: null, name: null, label: null },
      selectedColor: { id: null, name: null, hex: null, label: null },
      fabricColor: { name: null, hex: null },
      detailColor: { name: null, hex: null },
      elements: [],
      selectedOptions: {},
      customizationPriceCents: options?.customizationPriceCents ?? null,
      summary: [],
      areas: [],
      hasLogo: false,
      hasEmbroidery: false,
      embroideredName: null,
    }
  }

  const snapshot = buildSharedCustomizationSnapshot({
    design,
    configJson: configJson ?? design.configJson,
    variant: options?.variant
      ? {
          id: options.variant.id,
          color: options.variant.color
            ? {
                id: options.variant.color.id,
                name: options.variant.color.name,
                hex: options.variant.color.hex,
              }
            : null,
          size: options.variant.size
            ? {
                id: options.variant.size.id,
                name: options.variant.size.name,
              }
            : null,
        }
      : null,
    customizationPriceCents: options?.customizationPriceCents ?? null,
  })

  return snapshot
}

function resolveProductSnapshot(item: CartItemWithRelations): CartProductSnapshotGql {
  const fromConfig = parseConfigSnapshot(item.configSnapshotJson).productSnapshot
  if (fromConfig?.productId) {
    return enrichProductSnapshotWithConfig(
      fromConfig,
      item.design?.configJson,
    ) as CartProductSnapshotGql
  }
  return buildProductSnapshot(item, item.design?.configJson)
}

function resolveCustomizationSnapshot(item: CartItemWithRelations): CartCustomizationSnapshotGql {
  const fromConfig = parseConfigSnapshot(item.configSnapshotJson).customizationSnapshot
  if (fromConfig) return fromConfig
  return buildCustomizationSnapshot(item.design, item.design?.configJson, {
    variant: item.productVariant,
    customizationPriceCents: item.customizationPriceCents,
  })
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
  const totalPriceCents = (item.unitPriceCents + item.customizationPriceCents) * item.quantity

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
  extras?: CartConfigSnapshotJson,
): Prisma.InputJsonValue {
  const normalizedExtras = extras
    ? (JSON.parse(JSON.stringify(extras)) as Prisma.InputJsonObject)
    : {}

  return {
    productSnapshot,
    customizationSnapshot,
    ...normalizedExtras,
  } as Prisma.InputJsonObject
}
