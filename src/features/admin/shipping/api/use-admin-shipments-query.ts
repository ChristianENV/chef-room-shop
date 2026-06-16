'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminShipments } from './admin-shipments.api'
import { adminShipmentsQueryKeys } from './admin-shipments.query-keys'
import type { AdminShipmentsListVariables } from '../types'

/**
 * TanStack Query hook for paginated admin shipments list.
 */
export function useAdminShipmentsQuery(variables?: AdminShipmentsListVariables) {
  return useQuery({
    queryKey: adminShipmentsQueryKeys.list(variables),
    queryFn: () => getAdminShipments(variables),
  })
}
