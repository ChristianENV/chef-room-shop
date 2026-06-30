import type { ProductOptionSnapshot } from './product-options.types'

/**
 * Sum commercial option price deltas from validated server snapshots.
 * Never accepts client-provided price deltas.
 */
export function calculateProductOptionsPriceCents(snapshots: ProductOptionSnapshot[]): number {
  if (snapshots.length === 0) return 0
  return snapshots.reduce((sum, snapshot) => sum + snapshot.priceDeltaCents, 0)
}
