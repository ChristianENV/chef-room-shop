import 'server-only'

/**
 * When true, createCheckoutOrder may proceed without shippingRateId (shippingCents = 0).
 * Do not enable in production unless explicitly required for emergencies.
 */
export function isCheckoutShippingOptionalOnServer(): boolean {
  return process.env.ALLOW_CHECKOUT_WITHOUT_SHIPPING === 'true'
}

/**
 * Whether shippingRateId is mandatory for createCheckoutOrder on this deployment.
 */
export function isCheckoutShippingRequiredOnServer(): boolean {
  return !isCheckoutShippingOptionalOnServer()
}
