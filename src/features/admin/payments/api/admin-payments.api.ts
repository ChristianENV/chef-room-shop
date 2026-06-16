import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ADMIN_PAYMENTS_QUERY } from '../graphql/admin-payments.queries'
import type { AdminPaymentsListVariables, AdminPaymentsPayload } from '../types'

type AdminPaymentsData = { adminPayments: AdminPaymentsPayload }

/**
 * Lists payments for the admin panel (read-only).
 */
export async function getAdminPayments(
  variables?: AdminPaymentsListVariables,
): Promise<AdminPaymentsPayload> {
  const data = await fetchGraphQL<AdminPaymentsData, AdminPaymentsListVariables>({
    query: ADMIN_PAYMENTS_QUERY,
    variables,
  })
  return data.adminPayments
}
