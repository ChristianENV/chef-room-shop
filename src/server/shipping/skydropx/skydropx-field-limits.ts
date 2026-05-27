/** Skydropx PRO max length for address reference (quotations + shipments). */
export const SKYDROPX_REFERENCE_MAX_LENGTH = 30

/** Skydropx PRO max length for further_information on shipments. */
export const SKYDROPX_FURTHER_INFO_MAX_LENGTH = 70

/**
 * Truncates reference text to Skydropx max length (30 chars).
 */
export function truncateSkydropxReference(
  value: string,
  maxLength: number = SKYDROPX_REFERENCE_MAX_LENGTH,
): string {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  return trimmed.slice(0, maxLength).trim()
}
