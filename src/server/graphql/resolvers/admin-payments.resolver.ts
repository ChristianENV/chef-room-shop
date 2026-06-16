import type { GraphQLContext } from '../context'
import { getAdminPayments } from '../modules/admin-payments/admin-payments.service'
import type { AdminPaymentsListInput } from '../modules/admin-payments/admin-payments.types'

export const adminPaymentsResolvers = {
  Query: {
    adminPayments: (
      _parent: unknown,
      args: AdminPaymentsListInput,
      context: GraphQLContext,
    ) => getAdminPayments(context, args),
  },
}
