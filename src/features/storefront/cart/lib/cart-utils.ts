import type {
  CartPageState,
  CartPreview,
  CartPreviewCategory,
  CartPreviewItem,
} from '@/src/types/cart'

/** Free shipping threshold in MXN (mock business rule). */
export const FREE_SHIPPING_THRESHOLD_MXN = 2000

/** Standard shipping fee in MXN when below free-shipping threshold. */
export const STANDARD_SHIPPING_MXN = 199

/** Spanish labels for cart preview categories. */
export const CART_CATEGORY_LABELS: Record<CartPreviewCategory, string> = {
  filipina: 'Filipinas',
  mandil: 'Mandiles',
  pantalon: 'Pantalones',
}

/**
 * Returns the line total for a cart preview item (unit + customization × qty).
 */
export function getCartPreviewLineTotal(item: CartPreviewItem): number {
  if (item.lineTotal != null) return item.lineTotal
  const customization = item.customizationPrice ?? 0
  const options = item.optionPrice ?? 0
  return (item.unitPrice + customization + options) * item.quantity
}

/**
 * Formats item count copy for cart UI badges.
 */
export function formatCartItemCountLabel(count: number): string {
  if (count === 1) return '1 artículo'
  return `${count} artículos`
}

/**
 * Computes aggregate totals from cart line items.
 */
export function computeCartTotals(items: CartPreviewItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const customizationTotal = items.reduce(
    (sum, item) => sum + (item.customizationPrice ?? 0) * item.quantity,
    0,
  )
  const optionTotal = items.reduce((sum, item) => sum + (item.optionPrice ?? 0) * item.quantity, 0)
  const partialTotal = subtotal + customizationTotal + optionTotal
  const shipping = partialTotal >= FREE_SHIPPING_THRESHOLD_MXN ? 0 : STANDARD_SHIPPING_MXN
  const total = partialTotal + shipping
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    subtotal,
    customizationTotal,
    optionTotal,
    partialTotal,
    shipping,
    total,
    totalItems,
  }
}

/**
 * Builds a {@link CartPreview} from line items with derived totals.
 */
export function buildCartPreview(items: CartPreviewItem[]): CartPreview {
  const totals = computeCartTotals(items)
  return {
    items,
    subtotal: totals.subtotal,
    customizationTotal: totals.customizationTotal,
    optionTotal: totals.optionTotal,
    totalItems: totals.totalItems,
  }
}

/**
 * Builds a {@link CartPageState} from line items (includes shipping + grand total).
 */
export function buildCartPageState(items: CartPreviewItem[]): CartPageState {
  const preview = buildCartPreview(items)
  const { shipping, total } = computeCartTotals(items)
  return {
    ...preview,
    shipping,
    total,
  }
}

/**
 * Returns remaining amount (MXN) to reach free shipping, or 0 if already qualified.
 */
export function getFreeShippingRemaining(partialTotal: number): number {
  if (partialTotal >= FREE_SHIPPING_THRESHOLD_MXN) return 0
  return FREE_SHIPPING_THRESHOLD_MXN - partialTotal
}

/**
 * Updates quantity for a single line item (in-memory mock).
 */
export function updateCartPreviewItemQuantity(
  items: CartPreviewItem[],
  itemId: string,
  quantity: number,
): CartPreviewItem[] {
  return items.map((item) =>
    item.id === itemId ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) } : item,
  )
}

/**
 * Removes a line item by id (in-memory mock).
 */
export function removeCartPreviewItem(items: CartPreviewItem[], itemId: string): CartPreviewItem[] {
  return items.filter((item) => item.id !== itemId)
}
