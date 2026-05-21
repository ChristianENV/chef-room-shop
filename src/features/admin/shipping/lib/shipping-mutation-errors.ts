import { GraphQLRequestError } from '@/src/lib/graphql/errors'

/**
 * Maps GraphQL/shipping mutation errors to user-friendly Spanish copy.
 */
export function mapShippingMutationError(error: unknown): string {
  if (error instanceof GraphQLRequestError) {
    const message = error.message

    if (message.includes('ya fue generada')) {
      return 'La guía ya fue generada.'
    }
    if (message.includes('debe estar pagado')) {
      return 'La orden aún no está lista para generar guía.'
    }
    if (message.includes('expiró')) {
      return 'La tarifa de envío expiró. El cliente debe cotizar de nuevo en checkout.'
    }
    if (message.includes('tarifa')) {
      return message
    }
    if (message.includes('FORBIDDEN') || message.includes('permiso')) {
      return 'No tienes permiso para esta acción.'
    }

    return message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'No pudimos completar la acción. Intenta de nuevo.'
}
