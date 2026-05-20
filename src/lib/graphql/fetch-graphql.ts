import { GraphQLRequestError, type GraphQLErrorPayload } from './errors'

type GraphQLResponseBody<TData> = {
  data?: TData
  errors?: GraphQLErrorPayload[]
}

export type FetchGraphQLInput<TVariables> = {
  query: string
  variables?: TVariables
  headers?: HeadersInit
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

/**
 * Resolves the GraphQL BFF URL for browser and server runtimes.
 */
function getGraphQLEndpoint(): string {
  if (typeof window !== 'undefined') {
    return '/api/graphql'
  }

  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (fromEnv) {
    return `${fromEnv}/api/graphql`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/graphql`
  }

  return 'http://localhost:3000/api/graphql'
}

/**
 * Executes a GraphQL operation against the Chef Room BFF (`/api/graphql`).
 *
 * @throws {GraphQLRequestError} When the response includes GraphQL errors.
 */
export async function fetchGraphQL<TData, TVariables = Record<string, never>>(
  input: FetchGraphQLInput<TVariables>,
): Promise<TData> {
  const response = await fetch(getGraphQLEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...input.headers,
    },
    body: JSON.stringify({
      query: input.query,
      variables: input.variables ?? {},
    }),
    cache: input.cache ?? 'no-store',
    next: input.next,
  })

  if (!response.ok) {
    throw new GraphQLRequestError([
      { message: `GraphQL HTTP ${response.status}: ${response.statusText}` },
    ])
  }

  const body = (await response.json()) as GraphQLResponseBody<TData>

  if (body.errors?.length) {
    throw new GraphQLRequestError(body.errors)
  }

  if (body.data == null) {
    throw new GraphQLRequestError([{ message: 'GraphQL response missing data' }])
  }

  return body.data
}
