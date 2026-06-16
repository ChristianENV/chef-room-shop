'use client'

import { useDeferredValue, useMemo, useState } from 'react'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  AdminPaymentsError,
  AdminPaymentsTable,
  AdminPaymentsToolbar,
} from '@/src/features/admin/payments'
import { useAdminPaymentsQuery } from '@/src/features/admin/payments/api/use-admin-payments-query'
import {
  buildAdminPaymentsListVariables,
  mapAdminPaymentToTableRow,
} from '@/src/features/admin/payments/mappers/admin-payments-ui.mapper'
import type { AdminPaymentStatusFilter } from '@/src/features/admin/payments/types'

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<AdminPaymentStatusFilter>('all')

  const listVariables = useMemo(
    () =>
      buildAdminPaymentsListVariables({
        search: deferredSearch,
        statusFilter,
        limit: 50,
        offset: 0,
      }),
    [deferredSearch, statusFilter],
  )

  const paymentsQuery = useAdminPaymentsQuery(listVariables)

  const tableRows = useMemo(
    () => (paymentsQuery.data?.items ?? []).map(mapAdminPaymentToTableRow),
    [paymentsQuery.data?.items],
  )

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Pagos' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Pagos</h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Consulta transacciones de Conekta y su estado operativo.
          </p>
        </div>

        <AdminPaymentsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          total={paymentsQuery.data?.total}
        />

        {paymentsQuery.isError ? (
          <AdminPaymentsError onRetry={() => void paymentsQuery.refetch()} />
        ) : (
          <AdminPaymentsTable rows={tableRows} loading={paymentsQuery.isLoading} />
        )}
      </div>
    </AdminPageConfig>
  )
}
