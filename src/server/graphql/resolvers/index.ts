import { catalogResolvers } from './catalog.resolver'

export const resolvers = {
  Query: {
    health: () => 'ok',
    ...catalogResolvers.Query,
  },
}
