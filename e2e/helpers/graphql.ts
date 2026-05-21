import type { APIRequestContext } from '@playwright/test'

type GraphQLResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

/**
 * POST to Chef Room GraphQL BFF (/api/graphql).
 */
export async function postGraphQL<TData, TVariables = Record<string, never>>(
  request: APIRequestContext,
  query: string,
  variables?: TVariables,
  baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
): Promise<TData> {
  const response = await request.post(`${baseURL}/api/graphql`, {
    data: { query, variables: variables ?? {} },
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok()) {
    throw new Error(`GraphQL HTTP ${response.status()}: ${await response.text()}`)
  }

  const body = (await response.json()) as GraphQLResponse<TData>
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join('; '))
  }
  if (body.data === undefined) {
    throw new Error('GraphQL response missing data')
  }

  return body.data
}
