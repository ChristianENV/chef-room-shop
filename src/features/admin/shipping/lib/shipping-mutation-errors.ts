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
      return 'La tarifa de envío expiró. Vuelve a cotizar el envío antes de generar la guía.'
    }
    if (message.includes('dirección del pedido está incompleta')) {
      return 'La dirección del pedido está incompleta.'
    }
    if (message.includes('dirección de origen')) {
      return 'Configura la dirección de origen antes de generar guías.'
    }
    if (message.includes('Skydropx no pudo generar la guía')) {
      return `${message} Si persiste, revisa que la dirección y la tarifa sigan vigentes.`
    }
    if (message.includes('saldo') || message.includes('servicios habilitados')) {
      return message
    }
    if (message.includes('datos de envío no son válidos')) {
      return message
    }
    if (message.includes('autenticar con Skydropx')) {
      return message
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
