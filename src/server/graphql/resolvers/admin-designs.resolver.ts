import type { GraphQLContext } from '../context'
import {
  getAdminDesignById,
  getAdminDesigns,
} from '../modules/admin-designs/admin-designs.service'
import type { AdminDesignsListInput } from '../modules/admin-designs/admin-designs.types'

type AdminDesignsArgs = {
  filter?: AdminDesignsListInput['filter'] | null
  limit?: number | null
  offset?: number | null
}

type AdminDesignByIdArgs = {
  id: string
}

export const adminDesignsResolvers = {
  Query: {
    adminDesigns: (
      _parent: unknown,
      args: AdminDesignsArgs,
      context: GraphQLContext,
    ) =>
      getAdminDesigns(context, {
        filter: args.filter,
        limit: args.limit,
        offset: args.offset,
      }),

    adminDesignById: (
      _parent: unknown,
      args: AdminDesignByIdArgs,
      context: GraphQLContext,
    ) => getAdminDesignById(context, args.id),
  },
}
