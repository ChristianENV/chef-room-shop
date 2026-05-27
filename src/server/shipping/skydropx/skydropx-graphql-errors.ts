import { GraphQLError } from 'graphql'

import type { SkydropxApiError } from './skydropx.errors'
import { getSkydropxQuoteUserMessage, getSkydropxUserMessage } from './skydropx.user-messages'

/**
 * Maps Skydropx HTTP status to GraphQL extension code.
 */
export function mapSkydropxHttpStatusToGraphQLCode(status: number): string {
  if (status === 401 || status === 403) return 'SKYDROPX_AUTH_ERROR'
  if (status === 400 || status === 422) return 'SKYDROPX_VALIDATION_ERROR'
  if (status === 502 || status === 503 || status === 504 || status >= 500) {
    return 'SKYDROPX_API_ERROR'
  }
  return 'SKYDROPX_API_ERROR'
}

/**
 * Converts SkydropxApiError to a safe GraphQL error for quote or label flows.
 */
export function skydropxErrorToGraphQLError(
  error: SkydropxApiError,
  context: 'quote' | 'label',
): GraphQLError {
  const message =
    context === 'quote' ? getSkydropxQuoteUserMessage(error) : getSkydropxUserMessage(error)

  return new GraphQLError(message, {
    extensions: {
      code: mapSkydropxHttpStatusToGraphQLCode(error.status),
      status: error.status,
    },
  })
}
