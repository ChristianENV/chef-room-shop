/**
 * Result of merging a {@link GuestSession} into a registered {@link User}.
 */
export type GuestMergeResult = {
  merged: boolean
  conflict: boolean
  designsMerged: number
  addressesMerged: number
  cartItemsMerged: number
  ordersMerged: 0
}

/** Empty merge result (no-op or not found). */
export const EMPTY_GUEST_MERGE_RESULT: GuestMergeResult = {
  merged: false,
  conflict: false,
  designsMerged: 0,
  addressesMerged: 0,
  cartItemsMerged: 0,
  ordersMerged: 0,
}
