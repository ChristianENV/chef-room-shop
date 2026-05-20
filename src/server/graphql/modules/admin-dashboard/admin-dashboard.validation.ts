import { z } from 'zod'

const MAX_LIMIT = 50

const DEFAULTS = {
  recentOrders: 8,
  productionQueue: 8,
  recentDesigns: 8,
  recentPayments: 8,
  topProducts: 5,
} as const

/**
 * Parses list limit with per-query default and max 50.
 */
export function parseAdminListLimit(
  limit: number | null | undefined,
  defaultLimit: number,
): number {
  const schema = z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .optional()
    .nullable()
    .transform((v) => v ?? defaultLimit)

  return schema.parse(limit ?? defaultLimit)
}

/** Default limit for adminRecentOrders. */
export function parseRecentOrdersLimit(limit?: number | null): number {
  return parseAdminListLimit(limit, DEFAULTS.recentOrders)
}

/** Default limit for adminProductionQueue. */
export function parseProductionQueueLimit(limit?: number | null): number {
  return parseAdminListLimit(limit, DEFAULTS.productionQueue)
}

/** Default limit for adminRecentDesigns. */
export function parseRecentDesignsLimit(limit?: number | null): number {
  return parseAdminListLimit(limit, DEFAULTS.recentDesigns)
}

/** Default limit for adminRecentPayments. */
export function parseRecentPaymentsLimit(limit?: number | null): number {
  return parseAdminListLimit(limit, DEFAULTS.recentPayments)
}

/** Default limit for adminTopProducts (max 20 per spec). */
export function parseTopProductsLimit(limit?: number | null): number {
  const parsed = parseAdminListLimit(limit, DEFAULTS.topProducts)
  return Math.min(parsed, 20)
}
