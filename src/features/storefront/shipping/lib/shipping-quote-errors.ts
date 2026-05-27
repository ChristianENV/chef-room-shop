import { GraphQLRequestError } from '@/src/lib/graphql/errors'

/**
 * Maps GraphQL shipping errors to user-facing Spanish copy (no internal details).
 */
export function getShippingQuoteErrorMessage(error: unknown): string {
  if (error instanceof GraphQLRequestError) {
    const code = error.errors[0]?.extensions?.code
    const msg = error.errors[0]?.message ?? ''

    if (code === 'SERVICE_UNAVAILABLE') {
      return 'La cotización de envío no está disponible en este momento.'
    }
    if (code === 'SKYDROPX_VALIDATION_ERROR' || code === 'BAD_REQUEST') {
      if (msg) return msg
      return 'No pudimos cotizar ese destino. Revisa el código postal o intenta con otra dirección.'
    }
    if (code === 'SKYDROPX_API_ERROR' || code === 'BAD_GATEWAY') {
      return 'No pudimos cotizar el envío en este momento. Intenta de nuevo.'
    }
    if (code === 'SKYDROPX_AUTH_ERROR') {
      return 'La cotización de envío no está disponible en este momento.'
    }
    if (code === 'FORBIDDEN') {
      return 'No pudimos acceder a esta cotización. Cotiza de nuevo.'
    }
    if (msg) return msg
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
