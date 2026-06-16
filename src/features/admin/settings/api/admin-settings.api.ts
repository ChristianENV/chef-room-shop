import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ADMIN_SETTINGS_OVERVIEW_QUERY } from '../graphql/admin-settings.queries'
import type { AdminSettingsOverview } from '../types'

type AdminSettingsOverviewData = { adminSettingsOverview: AdminSettingsOverview }

/**
 * Loads read-only admin settings overview (admin session required).
 */
export async function getAdminSettingsOverview(): Promise<AdminSettingsOverview> {
  const data = await fetchGraphQL<AdminSettingsOverviewData>({
    query: ADMIN_SETTINGS_OVERVIEW_QUERY,
  })
  return data.adminSettingsOverview
}
