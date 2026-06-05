import {
  buildPricingSnapshot,
  calculateCustomizationFromConfigJson,
} from '@/src/features/storefront/customizer/pricing/calculate-customizer-price'

import type { GraphQLContext } from '../graphql/context'

type DesignConfigRecord = Record<string, unknown>

function configProductId(configJson: unknown): string | null {
  if (!configJson || typeof configJson !== 'object' || Array.isArray(configJson)) return null
  const productId = (configJson as DesignConfigRecord).productId
  return typeof productId === 'string' && productId.trim() ? productId : null
}

async function resolveBasePriceCents(
  context: GraphQLContext,
  configJson: unknown,
): Promise<number> {
  const productId = configProductId(configJson)
  if (!productId) return 0

  const product = await context.prisma.product.findFirst({
    where: { id: productId, deletedAt: null },
    select: { basePriceCents: true },
  })

  return product?.basePriceCents ?? 0
}

/**
 * Recalculates embroidery pricing server-side and merges a pricing snapshot into configJson.
 * Client-provided pricing values are never trusted.
 */
export async function applyServerPricingToConfigJson(
  context: GraphQLContext,
  configJson: unknown,
): Promise<Record<string, unknown>> {
  const base =
    configJson && typeof configJson === 'object' && !Array.isArray(configJson)
      ? { ...(configJson as DesignConfigRecord) }
      : {}

  const basePriceCents = await resolveBasePriceCents(context, configJson)
  const breakdown = calculateCustomizationFromConfigJson(configJson, basePriceCents)

  return {
    ...base,
    pricing: buildPricingSnapshot(breakdown),
  }
}

export function resolveCustomizationPriceFromConfig(
  configJson: unknown,
  basePriceCents: number,
): number {
  return calculateCustomizationFromConfigJson(configJson, basePriceCents).customizationPriceCents
}
