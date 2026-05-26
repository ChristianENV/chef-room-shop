/** Visual confirmation window on success page (does not mark payment as paid). */
export const CHECKOUT_CONFIRMATION_VISUAL_MS = 30_000

/** Fast polling while Conekta/webhook may still be processing (~32s). */
export const CHECKOUT_POLL_FAST_INTERVAL_MS = 4_000
export const CHECKOUT_POLL_FAST_MAX_ATTEMPTS = 8

/** Slower polling after the visual window until ~2 min total. */
export const CHECKOUT_POLL_SLOW_INTERVAL_MS = 12_000
export const CHECKOUT_POLL_SLOW_MAX_ATTEMPTS = 10
