import type { GraphQLContext } from '../../context'
import { requireAdminGraphQL } from './admin-settings.auth'
import { buildAdminSettingsOverview } from './admin-settings.mappers'
import type { AdminSettingsOverviewGql } from './admin-settings.types'

/**
 * Read-only operational settings for the admin panel (no secrets, no persistence).
 */
export async function getAdminSettingsOverview(
  context: GraphQLContext,
): Promise<AdminSettingsOverviewGql> {
  requireAdminGraphQL(context)
  return buildAdminSettingsOverview()
}
