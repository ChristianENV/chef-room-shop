import { accountResolvers } from './account.resolver'
import { adminDashboardResolvers } from './admin-dashboard.resolver'
import { adminOrdersResolvers } from './admin-orders.resolver'
import { cartResolvers } from './cart.resolver'
import { catalogResolvers } from './catalog.resolver'
import { checkoutResolvers } from './checkout.resolver'
import { orderClaimResolvers } from './order-claim.resolver'
import { paymentsResolvers } from './payments.resolver'
import { JSONScalar } from '../scalars/json.scalar'

export const resolvers = {
  JSON: JSONScalar,
  Query: {
    health: () => 'ok',
    ...catalogResolvers.Query,
    ...accountResolvers.Query,
    ...adminDashboardResolvers.Query,
    ...adminOrdersResolvers.Query,
    ...cartResolvers.Query,
    ...checkoutResolvers.Query,
    ...orderClaimResolvers.Query,
  },
  Mutation: {
    ...accountResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...checkoutResolvers.Mutation,
    ...paymentsResolvers.Mutation,
    ...orderClaimResolvers.Mutation,
    ...adminOrdersResolvers.Mutation,
  },
}
