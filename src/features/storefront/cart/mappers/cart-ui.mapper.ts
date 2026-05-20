import type {
  CartPageState,
  CartPreview,
  CartPreviewCategory,
  CartPreviewCustomizationSummary,
  CartPreviewItem,
} from '@/src/types/cart'
import { centsToPesos } from '@/src/lib/formatters'
import {
  FREE_SHIPPING_THRESHOLD_MXN,
  STANDARD_SHIPPING_MXN,
  getFreeShippingRemaining,
} from '@/src/features/storefront/cart/lib/cart-utils'

import type { Cart, CartItem } from '../types/cart-bff.types'

const DEFAULT_COLOR_HEX = '#E5E7EB'

/**
 * Infers storefront cart category from product slug and type label.
 */
function inferCartCategory(
  slug: string,
  productType: string | null,
): CartPreviewCategory {
  const hint = `${slug} ${productType ?? ''}`.toLowerCase()
  if (hint.includes('mandil') || hint.includes('apron')) return 'mandil'
  if (hint.includes('pantalon') || hint.includes('pants')) return 'pantalon'
  return 'filipina'
}

/**
 * Resolves the display image for a cart line (product image, then design preview).
 */
export function getCartItemDisplayImage(item: CartItem): string | undefined {
  const productUrl = item.productSnapshot?.imageUrl
  if (productUrl) return productUrl

  const previewUrl = item.customizationSnapshot?.previewUrl
  if (previewUrl) return previewUrl

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
  }
}

/**
 * Maps a single BFF cart line to the UI cart item shape (amounts in pesos).
 */
export function mapBffCartItemToUiItem(item: CartItem): CartPreviewItem {
  const snapshot = item.productSnapshot
  const slug = snapshot?.slug ?? item.product?.slug ?? ''
  const isCustomized =
    Boolean(item.designId) ||
    item.customizationPriceCents > 0 ||
    Boolean(item.customizationSnapshot?.designId)

  return {
    id: item.id,
    productId: item.productId,
    productSlug: slug,
    productName: snapshot?.name ?? item.product?.name ?? 'Producto',
    category: inferCartCategory(slug, snapshot?.productType ?? null),
    imageUrl: getCartItemDisplayImage(item),
    size: snapshot?.sizeName ?? '—',
    colorName: snapshot?.colorName ?? '—',
    colorHex: snapshot?.colorHex ?? DEFAULT_COLOR_HEX,
    quantity: item.quantity,
    unitPrice: centsToPesos(item.unitPriceCents),
    customizationPrice:
      item.customizationPriceCents > 0
        ? centsToPesos(item.customizationPriceCents)
        : undefined,
    isCustomized,
    designId: item.designId ?? item.customizationSnapshot?.designId ?? undefined,
    designPreviewUrl: item.customizationSnapshot?.previewUrl ?? undefined,
    customizationSummary: getCartItemCustomizationSummary(item),
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
    totalItems: cart.totalItems,
  }
}

/**
 * Maps BFF cart to full cart page state including shipping and grand total.
 */
export function mapBffCartToCartPage(cart: Cart): CartPageState {
  const preview = mapBffCartToCartPreview(cart)
  const partialTotalPesos = preview.subtotal + preview.customizationTotal
  const shippingFromBff = centsToPesos(cart.shippingCostCents)
  const shipping =
    shippingFromBff > 0
      ? shippingFromBff
      : partialTotalPesos >= FREE_SHIPPING_THRESHOLD_MXN
        ? 0
        : STANDARD_SHIPPING_MXN

  const discountPesos = centsToPesos(cart.discountTotalCents)
  const totalFromBff = centsToPesos(cart.totalCents)
  const total =
    cart.shippingCostCents > 0 || cart.discountTotalCents > 0
      ? totalFromBff
      : partialTotalPesos + shipping - discountPesos

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
    centsToPesos(cart.subtotalCents) + centsToPesos(cart.customizationTotalCents)
  return getFreeShippingRemaining(partial)
}
