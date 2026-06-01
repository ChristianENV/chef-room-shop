import { accountResolvers } from './account.resolver'
import { adminDashboardResolvers } from './admin-dashboard.resolver'
import { adminOrdersResolvers } from './admin-orders.resolver'
import { adminShippingResolvers } from './admin-shipping.resolver'
import { adminCustomizationResolvers } from './admin-customization.resolver'
import { adminProductsResolvers } from './admin-products.resolver'
import { cartResolvers } from './cart.resolver'
import { catalogResolvers } from './catalog.resolver'
import { checkoutResolvers } from './checkout.resolver'
import { shippingResolvers } from './shipping.resolver'
import { orderClaimResolvers } from './order-claim.resolver'
import { paymentsResolvers } from './payments.resolver'
import { uploadsResolvers } from './uploads.resolver'
import { designsResolvers } from './designs.resolver'
import { JSONScalar } from '../scalars/json.scalar'

export const resolvers = {
  JSON: JSONScalar,
  Query: {
    health: () => 'ok',
    ...catalogResolvers.Query,
    ...accountResolvers.Query,
    ...adminDashboardResolvers.Query,
    ...adminOrdersResolvers.Query,
    ...adminShippingResolvers.Query,
    ...adminProductsResolvers.Query,
    ...adminCustomizationResolvers.Query,
    ...cartResolvers.Query,
    ...shippingResolvers.Query,
    ...checkoutResolvers.Query,
    ...orderClaimResolvers.Query,
    ...designsResolvers.Query,
  },
  Mutation: {
    ...accountResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...shippingResolvers.Mutation,
    ...checkoutResolvers.Mutation,
    ...paymentsResolvers.Mutation,
    ...orderClaimResolvers.Mutation,
    ...adminOrdersResolvers.Mutation,
    ...adminShippingResolvers.Mutation,
    ...adminProductsResolvers.Mutation,
    ...adminCustomizationResolvers.Mutation,
    ...uploadsResolvers.Mutation,
    ...designsResolvers.Mutation,
  },
}
