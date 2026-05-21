/**
 * When true (non-production only), checkout can advance without a selected shipping rate.
 */
export function isCheckoutShippingOptional(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_CHECKOUT_WITHOUT_SHIPPING === 'true'
}

/**
 * Whether the checkout flow requires a selected Skydropx rate before payment.
 */
export function isCheckoutShippingRequired(): boolean {
  return !isCheckoutShippingOptional()
}
