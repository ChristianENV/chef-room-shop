import { GraphQLRequestError } from '@/src/lib/graphql/errors'

/**
 * Maps GraphQL shipping errors to user-facing Spanish copy (no internal details).
 */
export function getShippingQuoteErrorMessage(error: unknown): string {
  if (error instanceof GraphQLRequestError) {
    const code = error.errors[0]?.extensions?.code
    if (code === 'SERVICE_UNAVAILABLE') {
      return 'La cotización de envío no está disponible en este momento.'
    }
    if (code === 'BAD_GATEWAY') {
      return 'No pudimos cotizar el envío. Intenta de nuevo.'
    }
    if (code === 'BAD_REQUEST') {
      const msg = error.errors[0]?.message ?? ''
      if (msg.toLowerCase().includes('vacío') || msg.toLowerCase().includes('carrito')) {
        return 'Tu carrito está vacío. Agrega productos antes de cotizar envío.'
      }
      if (msg.toLowerCase().includes('postal') || msg.toLowerCase().includes('código')) {
        return 'Revisa el código postal e intenta de nuevo.'
      }
      return msg || 'Datos de envío inválidos.'
    }
    if (code === 'FORBIDDEN') {
      return 'No pudimos acceder a esta cotización. Cotiza de nuevo.'
    }
  }

  return 'No pudimos cotizar el envío. Intenta de nuevo.'
}

/**
 * Returns true when the error indicates Skydropx is not configured on the server.
 */
export function isSkydropxUnavailableError(error: unknown): boolean {
  return (
    error instanceof GraphQLRequestError &&
    error.errors.some((e) => e.extensions?.code === 'SERVICE_UNAVAILABLE')
  )
}
