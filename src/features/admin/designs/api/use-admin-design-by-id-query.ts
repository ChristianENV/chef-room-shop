'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminDesignById } from './admin-designs.api'
import { adminDesignsQueryKeys } from './admin-designs.query-keys'

/**
 * Loads a single design with configJson for the admin detail modal.
 */
export function useAdminDesignByIdQuery(designId: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: adminDesignsQueryKeys.detail(designId ?? ''),
    queryFn: () => getAdminDesignById(designId as string),
    enabled: Boolean(designId) && (options?.enabled ?? true),
  })
}
