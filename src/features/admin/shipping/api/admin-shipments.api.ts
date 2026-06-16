import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ADMIN_SHIPMENTS_QUERY } from '../graphql/admin-shipments.queries'
import type { AdminShipmentsListVariables, AdminShipmentsPayload } from '../types'

type AdminShipmentsData = { adminShipments: AdminShipmentsPayload }

/**
 * Lists shipments for the admin panel (read-only).
 */
export async function getAdminShipments(
  variables?: AdminShipmentsListVariables,
): Promise<AdminShipmentsPayload> {
  const data = await fetchGraphQL<AdminShipmentsData, AdminShipmentsListVariables>({
    query: ADMIN_SHIPMENTS_QUERY,
    variables,
  })
  return data.adminShipments
}
