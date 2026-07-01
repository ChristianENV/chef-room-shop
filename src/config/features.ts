/**
 * Client-safe feature flags (`NEXT_PUBLIC_*`).
 *
 * Defaults to enabled when unset so local/dev keeps Product Options on unless explicitly disabled.
 */

export const PRODUCT_OPTIONS_DISABLED_MESSAGE =
  'Las opciones comerciales no están disponibles en este momento.'

export const PRODUCT_OPTIONS_DISABLED_CODE = 'PRODUCT_OPTIONS_DISABLED'

/** Parses explicit true/false env values; falls back to `defaultEnabled` when unset or invalid. */
export function parseFeatureFlagEnv(
  raw: string | undefined | null,
  defaultEnabled = true,
): boolean {
  if (raw == null || raw.trim() === '') return defaultEnabled

  const value = raw.trim().toLowerCase()
  if (value === 'true' || value === '1' || value === 'yes') return true
  if (value === 'false' || value === '0' || value === 'no') return false

  return defaultEnabled
}

/** Whether commercial Product Options UI should be shown in the storefront/admin client. */
export function isProductOptionsEnabled(): boolean {
  return parseFeatureFlagEnv(process.env.NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS, true)
}
