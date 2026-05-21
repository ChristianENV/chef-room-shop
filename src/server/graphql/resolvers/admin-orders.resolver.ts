import type { GraphQLContext } from '../context'
import {
  addAdminOrderNote,
  addAdminOrderTracking,
  cancelAdminOrder,
  getAdminOrderByNumber,
  getAdminOrderProductionQueue,
  getAdminOrderProductionSheet,
  getAdminOrders,
  getAdminOrderStatusSummary,
  markAdminOrderReadyToShip,
  moveAdminOrderToProduction,
  updateAdminOrderStatus,
} from '../modules/admin-orders/admin-orders.service'
import type {
  AddAdminOrderNoteInput,
  AddAdminOrderTrackingInput,
  AdminOrdersListInput,
  UpdateAdminOrderStatusInput,
} from '../modules/admin-orders/admin-orders.types'

type AdminOrdersQueryArgs = AdminOrdersListInput

type OrderNumberArgs = {
  orderNumber: string
}

type ProductionQueueArgs = {
  limit?: number | null
}

type CancelOrderArgs = {
  orderNumber: string
  reason?: string | null
}

type MutationInputArgs<T> = {
  input: T
}

export const adminOrdersResolvers = {
  Query: {
    adminOrders: (
      _parent: unknown,
      args: AdminOrdersQueryArgs,
      context: GraphQLContext,
    ) => getAdminOrders(context, args),

    adminOrderByNumber: (
      _parent: unknown,
      args: OrderNumberArgs,
      context: GraphQLContext,
    ) => getAdminOrderByNumber(context, args.orderNumber),

    adminOrderStatusSummary: (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext,
    ) => getAdminOrderStatusSummary(context),

    adminOrderProductionQueue: (
      _parent: unknown,
      args: ProductionQueueArgs,
      context: GraphQLContext,
    ) => getAdminOrderProductionQueue(context, args.limit),

    adminOrderProductionSheet: (
      _parent: unknown,
      args: OrderNumberArgs,
      context: GraphQLContext,
    ) => getAdminOrderProductionSheet(context, args.orderNumber),
  },

  Mutation: {
    updateAdminOrderStatus: (
      _parent: unknown,
      args: MutationInputArgs<UpdateAdminOrderStatusInput>,
      context: GraphQLContext,
    ) => updateAdminOrderStatus(context, args.input),

    moveAdminOrderToProduction: (
      _parent: unknown,
      args: OrderNumberArgs,
      context: GraphQLContext,
    ) => moveAdminOrderToProduction(context, args.orderNumber),

    markAdminOrderReadyToShip: (
      _parent: unknown,
      args: OrderNumberArgs,
      context: GraphQLContext,
    ) => markAdminOrderReadyToShip(context, args.orderNumber),

    addAdminOrderTracking: (
      _parent: unknown,
      args: MutationInputArgs<AddAdminOrderTrackingInput>,
      context: GraphQLContext,
    ) => addAdminOrderTracking(context, args.input),

    cancelAdminOrder: (
      _parent: unknown,
      args: CancelOrderArgs,
      context: GraphQLContext,
    ) => cancelAdminOrder(context, args.orderNumber, args.reason),

    addAdminOrderNote: (
      _parent: unknown,
      args: MutationInputArgs<AddAdminOrderNoteInput>,
      context: GraphQLContext,
    ) => addAdminOrderNote(context, args.input),
  },
}
