import { GraphQLError } from 'graphql'

export type VariantBatchInputRecord = {
  id?: string | null
  colorId: string
  sizeId: string
  sku?: string | null
  variantName?: string | null
  priceCents?: number | null
  stockQty?: number | null
  isActive?: boolean | null
}

function badUserInputError(
  message: string,
  details?: Record<string, string | string[]>,
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: 'BAD_USER_INPUT',
      ...details,
    },
  })
}

export const VARIANT_BATCH_DUPLICATE_CELL_MESSAGE =
  'Hay variantes duplicadas para el mismo color y talla.'

export const VARIANT_BATCH_DUPLICATE_SKU_MESSAGE = 'Hay SKUs de variante duplicados en el lote.'

export const VARIANT_BATCH_EMPTY_MESSAGE = 'No hay variantes para sincronizar.'

/**
 * Stable key for a color/size combination inside a variant batch.
 */
export function variantBatchCellKey(colorId: string, sizeId: string): string {
  return `${colorId}::${sizeId}`
}

/**
 * Fails the whole batch when two inputs target the same color/size cell.
 */
export function assertNoDuplicateBatchCells(variants: readonly VariantBatchInputRecord[]): void {
  const seen = new Set<string>()
  for (const variant of variants) {
    const key = variantBatchCellKey(variant.colorId, variant.sizeId)
    if (seen.has(key)) {
      throw badUserInputError(VARIANT_BATCH_DUPLICATE_CELL_MESSAGE, {
        colorId: variant.colorId,
        sizeId: variant.sizeId,
      })
    }
    seen.add(key)
  }
}

/**
 * Fails the whole batch when two resolved SKUs collide (case-insensitive).
 */
export function assertNoDuplicateBatchSkus(skus: readonly string[]): void {
  const seen = new Set<string>()
  for (const raw of skus) {
    const normalized = raw.trim().toUpperCase()
    if (!normalized) continue
    if (seen.has(normalized)) {
      throw badUserInputError(VARIANT_BATCH_DUPLICATE_SKU_MESSAGE, { sku: normalized })
    }
    seen.add(normalized)
  }
}

export type VariantBatchSummary = {
  createdCount: number
  updatedCount: number
  archivedCount: number
}

/**
 * Derives created/updated/archived counts from the resolved batch intent.
 * - inputs without id are creates
 * - inputs with id and isActive === false are archives (soft-delete)
 * - inputs with id otherwise are updates (includes reactivations)
 */
export function summarizeVariantBatch(
  variants: readonly VariantBatchInputRecord[],
): VariantBatchSummary {
  let createdCount = 0
  let updatedCount = 0
  let archivedCount = 0

  for (const variant of variants) {
    if (!variant.id) {
      createdCount += 1
      continue
    }
    if (variant.isActive === false) {
      archivedCount += 1
      continue
    }
    updatedCount += 1
  }

  return { createdCount, updatedCount, archivedCount }
}
