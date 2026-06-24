import { GraphQLError } from 'graphql'

/**
 * Returns whether a product type can be archived (no active products linked).
 */
export function canArchiveProductType(activeProductCount: number): boolean {
  return activeProductCount === 0
}

/**
 * Throws when archiving is blocked by active products.
 */
export function assertCanArchiveProductType(activeProductCount: number): void {
  if (!canArchiveProductType(activeProductCount)) {
    throw new GraphQLError('No se puede archivar una categoría que tiene productos activos.', {
      extensions: { code: 'CONFLICT' },
    })
  }
}
