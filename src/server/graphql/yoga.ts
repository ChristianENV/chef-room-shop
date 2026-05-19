import { createYoga } from 'graphql-yoga'

import { createGraphQLContext, type GraphQLContext } from './context'
import { schema } from './schema'

export const { handleRequest } = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: '/api/graphql',
  context: createGraphQLContext,
  fetchAPI: { Response },
})
