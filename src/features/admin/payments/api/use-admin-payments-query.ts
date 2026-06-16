'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminPayments } from './admin-payments.api'
import { adminPaymentsQueryKeys } from './admin-payments.query-keys'
import type { AdminPaymentsListVariables } from '../types'

/**
 * TanStack Query hook for paginated admin payments list.
 */
export function useAdminPaymentsQuery(variables?: AdminPaymentsListVariables) {
  return useQuery({
    queryKey: adminPaymentsQueryKeys.list(variables),
    queryFn: () => getAdminPayments(variables),
  })
}
