'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminDesignConfigJson } from './admin-design-config.api'
import { adminOrdersQueryKeys } from './admin-orders.query-keys'

/** Loads Design.configJson for admin order customization audit. */
export function useAdminDesignConfigQuery(
  designId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: adminOrdersQueryKeys.designConfig(designId ?? 'none'),
    queryFn: () => getAdminDesignConfigJson(designId!),
    enabled: Boolean(designId) && (options?.enabled ?? true),
  })
}
