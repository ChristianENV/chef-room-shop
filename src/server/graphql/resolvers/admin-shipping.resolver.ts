import type { GraphQLContext } from '../context'
import {
  cancelAdminShippingLabel,
  createAdminShippingLabel,
  getAdminShipmentByOrderNumber,
  refreshAdminShipmentTracking,
} from '../modules/admin-shipping/admin-shipping.service'
import type {
  AdminCancelShippingLabelInput,
  AdminCreateShippingLabelInput,
} from '../modules/admin-shipping/admin-shipping.types'

type OrderNumberArgs = {
  orderNumber: string
}

type MutationInputArgs<T> = {
  input: T
}

export const adminShippingResolvers = {
  Query: {
    adminShipmentByOrderNumber: (
      _parent: unknown,
      args: OrderNumberArgs,
      context: GraphQLContext,
    ) => getAdminShipmentByOrderNumber(context, args.orderNumber),
  },

  Mutation: {
    adminCreateShippingLabel: (
      _parent: unknown,
      args: MutationInputArgs<AdminCreateShippingLabelInput>,
      context: GraphQLContext,
    ) => createAdminShippingLabel(context, args.input),

    adminCancelShippingLabel: (
      _parent: unknown,
      args: MutationInputArgs<AdminCancelShippingLabelInput>,
      context: GraphQLContext,
    ) => cancelAdminShippingLabel(context, args.input),

    adminRefreshShipmentTracking: (
      _parent: unknown,
      args: OrderNumberArgs,
      context: GraphQLContext,
    ) => refreshAdminShipmentTracking(context, args.orderNumber),
  },
}
