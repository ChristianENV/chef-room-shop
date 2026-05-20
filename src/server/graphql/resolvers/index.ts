import { accountResolvers } from './account.resolver'
import { adminDashboardResolvers } from './admin-dashboard.resolver'
import { cartResolvers } from './cart.resolver'
import { catalogResolvers } from './catalog.resolver'
import { JSONScalar } from '../scalars/json.scalar'

export const resolvers = {
  JSON: JSONScalar,
  Query: {
    health: () => 'ok',
    ...catalogResolvers.Query,
    ...accountResolvers.Query,
    ...adminDashboardResolvers.Query,
    ...cartResolvers.Query,
  },
  Mutation: {
    ...accountResolvers.Mutation,
    ...cartResolvers.Mutation,
  },
}
