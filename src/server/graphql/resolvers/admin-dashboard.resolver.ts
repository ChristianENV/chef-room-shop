import type { GraphQLContext } from '../context'
import {
  getAdminDashboardMetrics,
  getAdminProductionQueue,
  getAdminRecentDesigns,
  getAdminRecentOrders,
  getAdminRecentPayments,
  getAdminTopProducts,
} from '../modules/admin-dashboard/admin-dashboard.service'

type LimitArgs = {
  limit?: number | null
}

export const adminDashboardResolvers = {
  Query: {
    adminDashboardMetrics: (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext,
    ) => getAdminDashboardMetrics(context),

    adminRecentOrders: (_parent: unknown, args: LimitArgs, context: GraphQLContext) =>
      getAdminRecentOrders(context, args.limit),

    adminProductionQueue: (_parent: unknown, args: LimitArgs, context: GraphQLContext) =>
      getAdminProductionQueue(context, args.limit),

    adminRecentDesigns: (_parent: unknown, args: LimitArgs, context: GraphQLContext) =>
      getAdminRecentDesigns(context, args.limit),

    adminRecentPayments: (_parent: unknown, args: LimitArgs, context: GraphQLContext) =>
      getAdminRecentPayments(context, args.limit),

    adminTopProducts: (_parent: unknown, args: LimitArgs, context: GraphQLContext) =>
      getAdminTopProducts(context, args.limit),
  },
}
