/** GraphQL error entry from a failed BFF response. */
export type GraphQLErrorPayload = {
  message: string
  path?: ReadonlyArray<string | number>
  extensions?: {
    code?: string
  }
}

/**
 * Thrown when the GraphQL endpoint returns one or more errors.
 */
export class GraphQLRequestError extends Error {
  readonly errors: GraphQLErrorPayload[]

  constructor(errors: GraphQLErrorPayload[]) {
    const message = errors.map((e) => e.message).join('; ') || 'GraphQL request failed'
    super(message)
    this.name = 'GraphQLRequestError'
    this.errors = errors
  }
}
