import { readPreviewsFromConfig } from '@/src/features/storefront/customizer/lib/design-preview-config'
import type { AccountDesign } from '../types'

/** Resolves the best available preview URL for a saved design. */
export function resolveDesignPreviewUrl(
  design: Pick<AccountDesign, 'previewUrl' | 'configJson'>,
): string | null {
  if (design.previewUrl) return design.previewUrl
  return readPreviewsFromConfig(design.configJson)?.front?.url ?? null
}
