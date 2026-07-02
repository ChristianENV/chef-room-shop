import { accountResolvers } from './account.resolver'
import { adminDesignsResolvers } from './admin-designs.resolver'
import { adminSettingsResolvers } from './admin-settings.resolver'
import { adminPaymentsResolvers } from './admin-payments.resolver'
import { adminUsersResolvers } from './admin-users.resolver'
import { adminInvitationsResolvers } from './admin-invitations.resolver'
import { adminDashboardResolvers } from './admin-dashboard.resolver'
import { adminOrdersResolvers } from './admin-orders.resolver'
import { adminShippingResolvers } from './admin-shipping.resolver'
import { adminCustomizationResolvers } from './admin-customization.resolver'
import { adminColorsResolvers } from './admin-colors.resolver'
import { adminProductTypesResolvers } from './admin-product-types.resolver'
import { adminProductsResolvers } from './admin-products.resolver'
import { adminProductOptionsResolver } from './admin-product-options.resolver'
import { cartResolvers } from './cart.resolver'
import { catalogResolvers } from './catalog.resolver'
import { checkoutResolvers } from './checkout.resolver'
import { shippingResolvers } from './shipping.resolver'
import { orderClaimResolvers } from './order-claim.resolver'
import { paymentsResolvers } from './payments.resolver'
import { uploadsResolvers } from './uploads.resolver'
import { designsResolvers } from './designs.resolver'
import { notificationsResolvers } from '@/src/server/notifications/notification.resolver'
import { JSONScalar } from '../scalars/json.scalar'

export const resolvers = {
  JSON: JSONScalar,
  Query: {
    health: () => 'ok',
    ...catalogResolvers.Query,
    ...accountResolvers.Query,
    ...adminDashboardResolvers.Query,
    ...adminUsersResolvers.Query,
    ...adminInvitationsResolvers.Query,
    ...adminPaymentsResolvers.Query,
    ...adminDesignsResolvers.Query,
    ...adminSettingsResolvers.Query,
    ...adminOrdersResolvers.Query,
    ...adminShippingResolvers.Query,
    ...adminProductsResolvers.Query,
    ...adminProductOptionsResolver.Query,
    ...adminColorsResolvers.Query,
    ...adminProductTypesResolvers.Query,
    ...adminCustomizationResolvers.Query,
    ...cartResolvers.Query,
    ...shippingResolvers.Query,
    ...checkoutResolvers.Query,
    ...orderClaimResolvers.Query,
    ...designsResolvers.Query,
    ...notificationsResolvers.Query,
  },
  Mutation: {
    ...accountResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...shippingResolvers.Mutation,
    ...checkoutResolvers.Mutation,
    ...paymentsResolvers.Mutation,
    ...orderClaimResolvers.Mutation,
    ...adminUsersResolvers.Mutation,
    ...adminInvitationsResolvers.Mutation,
    ...adminOrdersResolvers.Mutation,
    ...adminShippingResolvers.Mutation,
    ...adminProductsResolvers.Mutation,
    ...adminProductOptionsResolver.Mutation,
    ...adminColorsResolvers.Mutation,
    ...adminProductTypesResolvers.Mutation,
    ...adminCustomizationResolvers.Mutation,
    ...uploadsResolvers.Mutation,
    ...designsResolvers.Mutation,
    ...notificationsResolvers.Mutation,
  },
}
