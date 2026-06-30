import type {
  CartPageState,
  CartPreview,
  CartPreviewCategory,
  CartPreviewCustomizationSummary,
  CartPreviewItem,
} from '@/src/types/cart'
import { buildCustomizationSummaryLine } from '@/src/lib/customization/build-customization-snapshot'
import { centsToPesos } from '@/src/lib/formatters'
import {
  FREE_SHIPPING_THRESHOLD_MXN,
  STANDARD_SHIPPING_MXN,
  getFreeShippingRemaining,
} from '@/src/features/storefront/cart/lib/cart-utils'

import type {
  Cart,
  CartCommercialOptionSnapshot,
  CartItem,
} from '../types/cart-bff.types'

const DEFAULT_COLOR_HEX = '#E5E7EB'

function isCommercialOptionSnapshot(value: unknown): value is CartCommercialOptionSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.groupId === 'string' &&
    typeof record.groupSlug === 'string' &&
    typeof record.groupName === 'string' &&
    typeof record.valueId === 'string' &&
    typeof record.valueSlug === 'string' &&
    typeof record.valueLabel === 'string' &&
    typeof record.priceDeltaCents === 'number'
  )
}

/**
 * Normalizes commercial option snapshots from BFF cart items.
 */
export function normalizeCommercialOptionsSnapshot(
  value: CartCommercialOptionSnapshot[] | null | undefined,
): CartCommercialOptionSnapshot[] {
  if (!Array.isArray(value)) return []
  return value.filter(isCommercialOptionSnapshot)
}

/**
 * Infers storefront cart category from product slug and type label.
 */
function inferCartCategory(slug: string, productType: string | null): CartPreviewCategory {
  const hint = `${slug} ${productType ?? ''}`.toLowerCase()
  if (hint.includes('mandil') || hint.includes('apron')) return 'mandil'
  if (hint.includes('pantalon') || hint.includes('pants')) return 'pantalon'
  return 'filipina'
}

/**
 * Resolves the display image for a cart line (product image, then design preview).
 */
export function getCartItemDisplayImage(item: CartItem): string | undefined {
  const previewUrl = item.customizationSnapshot?.previewUrl
  if (previewUrl) return previewUrl

  const productUrl = item.productSnapshot?.imageUrl
  if (productUrl) return productUrl

  return undefined
}

/**
 * Maps BFF customization snapshot to UI summary shape.
 */
export function getCartItemCustomizationSummary(
  item: CartItem,
): CartPreviewCustomizationSummary | undefined {
  const snap = item.customizationSnapshot
  if (!snap) return undefined

  const hasFlags =
    snap.hasLogo ||
    snap.hasEmbroidery ||
    Boolean(snap.embroideredName) ||
    snap.areas.length > 0 ||
    snap.summary.length > 0

  if (!hasFlags && !item.designId) return undefined

  return {
    hasLogo: snap.hasLogo,
    hasEmbroidery: snap.hasEmbroidery,
    embroideredName: snap.embroideredName ?? undefined,
    areas: snap.areas.length > 0 ? snap.areas : undefined,
    lines: snap.summary.length > 0 ? snap.summary.slice(0, 3) : undefined,
  }
}

/**
 * Maps a single BFF cart line to the UI cart item shape (amounts in pesos).
 */
export function mapBffCartItemToUiItem(item: CartItem): CartPreviewItem {
  const snapshot = item.productSnapshot
  const customization = item.customizationSnapshot
  const slug = snapshot?.slug ?? item.product?.slug ?? ''

  const sizeLabel =
    snapshot?.sizeName ??
    customization?.selectedSize?.label ??
    customization?.selectedSize?.name ??
    customization?.selectedOptions?.sizeLabel ??
    customization?.selectedOptions?.size ??
    '—'

  const fabricColorName =
    customization?.fabricColor?.name ??
    snapshot?.colorName ??
    customization?.selectedColor?.name ??
    '—'

  const fabricColorHex =
    customization?.fabricColor?.hex ??
    snapshot?.colorHex ??
    customization?.selectedColor?.hex ??
    DEFAULT_COLOR_HEX

  const detailColorName = customization?.detailColor?.name ?? null
  const detailColorHex = customization?.detailColor?.hex ?? null

  const summaryLine = customization
    ? buildCustomizationSummaryLine({
        designId: customization.designId,
        previewUrl: customization.previewUrl,
        previewBackUrl: customization.previewBackUrl ?? null,
        selectedVariantId: customization.selectedVariantId ?? null,
        selectedSize: customization.selectedSize ?? { id: null, name: null, label: null },
        selectedColor: customization.selectedColor ?? {
          id: null,
          name: null,
          hex: null,
          label: null,
        },
        fabricColor: customization.fabricColor ?? { name: null, hex: null },
        detailColor: customization.detailColor ?? { name: null, hex: null },
        elements: customization.elements ?? [],
        selectedOptions: customization.selectedOptions ?? {},
        customizationPriceCents: customization.customizationPriceCents ?? null,
        summary: customization.summary,
        areas: customization.areas,
        hasLogo: customization.hasLogo,
        hasEmbroidery: customization.hasEmbroidery,
        embroideredName: customization.embroideredName,
      })
    : null

  const isCustomized =
    Boolean(item.designId) || item.customizationPriceCents > 0 || Boolean(customization?.designId)

  const customizationSummary = getCartItemCustomizationSummary(item)
  if (summaryLine && customizationSummary) {
    customizationSummary.personalizationLine = summaryLine
  }

  const optionPriceCents = item.optionPriceCents ?? 0
  const commercialOptionsSnapshot = normalizeCommercialOptionsSnapshot(
    item.commercialOptionsSnapshot,
  )

  return {
    id: item.id,
    productId: item.productId,
    productSlug: slug,
    productName: snapshot?.name ?? item.product?.name ?? 'Producto',
    category: inferCartCategory(slug, snapshot?.productType ?? null),
    imageUrl: getCartItemDisplayImage(item),
    size: typeof sizeLabel === 'string' ? sizeLabel : String(sizeLabel ?? '—'),
    colorName: fabricColorName,
    colorHex: fabricColorHex,
    detailColorName,
    detailColorHex,
    quantity: item.quantity,
    unitPrice: centsToPesos(item.unitPriceCents),
    customizationPrice:
      item.customizationPriceCents > 0 ? centsToPesos(item.customizationPriceCents) : undefined,
    optionPrice: optionPriceCents > 0 ? centsToPesos(optionPriceCents) : undefined,
    lineTotal: centsToPesos(item.totalPriceCents),
    commercialOptionsSnapshot,
    isCustomized,
    designId: item.designId ?? customization?.designId ?? undefined,
    designPreviewUrl: customization?.previewUrl ?? undefined,
    customizationSummary,
  }
}

/**
 * Maps BFF cart to popover preview shape (pesos for displayed amounts).
 */
export function mapBffCartToCartPreview(cart: Cart): CartPreview {
  return {
    items: cart.items.map(mapBffCartItemToUiItem),
    subtotal: centsToPesos(cart.subtotalCents),
    customizationTotal: centsToPesos(cart.customizationTotalCents),
    optionTotal: centsToPesos(cart.optionTotalCents ?? 0),
    totalItems: cart.totalItems,
  }
}

/**
 * Maps BFF cart to full cart page state including shipping and grand total.
 */
export function mapBffCartToCartPage(cart: Cart): CartPageState {
  const preview = mapBffCartToCartPreview(cart)
  const merchandiseSubtotalPesos =
    preview.subtotal + preview.customizationTotal + preview.optionTotal
  const shippingFromBff = centsToPesos(cart.shippingCostCents)
  const shipping =
    shippingFromBff > 0
      ? shippingFromBff
      : merchandiseSubtotalPesos >= FREE_SHIPPING_THRESHOLD_MXN
        ? 0
        : STANDARD_SHIPPING_MXN

  const total = centsToPesos(cart.totalCents) + shipping

  return {
    ...preview,
    shipping,
    total,
  }
}

/**
 * Remaining MXN to free shipping for cart page promo (from BFF subtotals).
 */
export function getCartPageFreeShippingRemaining(cart: Cart): number {
  const partial =
    centsToPesos(cart.subtotalCents) +
    centsToPesos(cart.customizationTotalCents) +
    centsToPesos(cart.optionTotalCents ?? 0)
  return getFreeShippingRemaining(partial)
}
