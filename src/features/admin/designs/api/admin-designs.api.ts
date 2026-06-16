import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ADMIN_DESIGN_BY_ID_QUERY,
  ADMIN_DESIGNS_QUERY,
} from '../graphql/admin-designs.queries'
import type {
  AdminDesignDetail,
  AdminDesignsListVariables,
  AdminDesignsPayload,
} from '../types'

type AdminDesignsData = { adminDesigns: AdminDesignsPayload }
type AdminDesignByIdData = { adminDesignById: AdminDesignDetail | null }

/**
 * Lists designs for the admin panel (read-only).
 */
export async function getAdminDesigns(
  variables?: AdminDesignsListVariables,
): Promise<AdminDesignsPayload> {
  const data = await fetchGraphQL<AdminDesignsData, AdminDesignsListVariables>({
    query: ADMIN_DESIGNS_QUERY,
    variables,
  })
  return data.adminDesigns
}

/**
 * Loads a single design with configJson for admin detail view.
 */
export async function getAdminDesignById(id: string): Promise<AdminDesignDetail | null> {
  const data = await fetchGraphQL<AdminDesignByIdData, { id: string }>({
    query: ADMIN_DESIGN_BY_ID_QUERY,
    variables: { id },
  })
  return data.adminDesignById
}
