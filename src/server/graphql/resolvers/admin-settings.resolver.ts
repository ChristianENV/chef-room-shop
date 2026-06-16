import type { GraphQLContext } from '../context'
import { getAdminSettingsOverview } from '../modules/admin-settings/admin-settings.service'

export const adminSettingsResolvers = {
  Query: {
    adminSettingsOverview: (
      _parent: unknown,
      _args: Record<string, never>,
      context: GraphQLContext,
    ) => getAdminSettingsOverview(context),
  },
}
