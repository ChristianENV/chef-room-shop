import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ADMIN_DESIGN_CONFIG_JSON_QUERY } from '../graphql/admin-orders.queries'

type AdminDesignConfigJsonData = {
  adminDesignConfigJson: unknown | null
}

/** Fetches Design.configJson for admin audit (requires ADMIN session). */
export async function getAdminDesignConfigJson(designId: string): Promise<unknown | null> {
  const data = await fetchGraphQL<AdminDesignConfigJsonData, { designId: string }>({
    query: ADMIN_DESIGN_CONFIG_JSON_QUERY,
    variables: { designId },
  })
  return data.adminDesignConfigJson
}
