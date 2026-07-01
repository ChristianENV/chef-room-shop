import 'server-only'

import {
  isProductOptionsEnabled,
  parseFeatureFlagEnv,
  PRODUCT_OPTIONS_DISABLED_CODE,
  PRODUCT_OPTIONS_DISABLED_MESSAGE,
} from './features'

export { PRODUCT_OPTIONS_DISABLED_CODE, PRODUCT_OPTIONS_DISABLED_MESSAGE }

/** Server-side Product Options rollout toggle (`ENABLE_PRODUCT_OPTIONS` overrides public flag). */
export function isProductOptionsEnabledOnServer(): boolean {
  const serverFlag = process.env.ENABLE_PRODUCT_OPTIONS
  if (serverFlag != null && serverFlag.trim() !== '') {
    return parseFeatureFlagEnv(serverFlag, true)
  }
  return isProductOptionsEnabled()
}

export type ProductOptionsFeatureGateResult =
  | { ok: true }
  | { ok: false; error: string; code: typeof PRODUCT_OPTIONS_DISABLED_CODE }

/**
 * Blocks new commercial option selections when the feature is disabled.
 * Allows empty payloads so legacy carts/orders keep working without charging options.
 */
export function assertProductOptionsFeatureEnabled(
  selectedCommercialOptionsCount: number,
): ProductOptionsFeatureGateResult {
  if (isProductOptionsEnabledOnServer()) {
    return { ok: true }
  }

  if (selectedCommercialOptionsCount > 0) {
    return {
      ok: false,
      error: PRODUCT_OPTIONS_DISABLED_MESSAGE,
      code: PRODUCT_OPTIONS_DISABLED_CODE,
    }
  }

  return { ok: true }
}
