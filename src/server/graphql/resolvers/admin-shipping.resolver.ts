import type { GraphQLContext } from '../context'
import {
  cancelAdminShippingLabel,
  createAdminShippingLabel,
  adminSimulateMockShipmentTrackingStatus,
  getAdminShipmentByOrderNumber,
  getAdminShipments,
  refreshAdminShipmentTracking,
} from '../modules/admin-shipping/admin-shipping.service'
import type {
  AdminCancelShippingLabelInput,
  AdminCreateShippingLabelInput,
  AdminShipmentsListInput,
  AdminSimulateMockShipmentTrackingInput,
} from '../modules/admin-shipping/admin-shipping.types'

type OrderNumberArgs = {
  orderNumber: string
}

type AdminShipmentsArgs = {
  filter?: AdminShipmentsListInput['filter'] | null
  limit?: number | null
  offset?: number | null
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

    adminShipments: (
      _parent: unknown,
      args: AdminShipmentsArgs,
      context: GraphQLContext,
    ) =>
      getAdminShipments(context, {
        filter: args.filter,
        limit: args.limit,
        offset: args.offset,
      }),
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

    adminSimulateMockShipmentTrackingStatus: (
      _parent: unknown,
      args: MutationInputArgs<AdminSimulateMockShipmentTrackingInput>,
      context: GraphQLContext,
    ) => adminSimulateMockShipmentTrackingStatus(context, args.input),
  },
}
