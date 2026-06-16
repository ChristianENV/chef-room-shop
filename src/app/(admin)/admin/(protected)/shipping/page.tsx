'use client'

import { useDeferredValue, useMemo, useState } from 'react'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  AdminShipmentsError,
  AdminShipmentsTable,
  AdminShipmentsToolbar,
} from '@/src/features/admin/shipping'
import { useAdminShipmentsQuery } from '@/src/features/admin/shipping/api/use-admin-shipments-query'
import {
  buildAdminShipmentsListVariables,
  mapAdminShipmentListItemToTableRow,
} from '@/src/features/admin/shipping/mappers/admin-shipments-list-ui.mapper'
import type { AdminShipmentStatusFilter } from '@/src/features/admin/shipping/types'

export default function AdminShippingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<AdminShipmentStatusFilter>('all')

  const listVariables = useMemo(
    () =>
      buildAdminShipmentsListVariables({
        search: deferredSearch,
        statusFilter,
        limit: 50,
        offset: 0,
      }),
    [deferredSearch, statusFilter],
  )

  const shipmentsQuery = useAdminShipmentsQuery(listVariables)

  const tableRows = useMemo(
    () => (shipmentsQuery.data?.items ?? []).map(mapAdminShipmentListItemToTableRow),
    [shipmentsQuery.data?.items],
  )

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Envíos' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Envíos</h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Consulta guías, rastreo y estado operativo de los envíos.
          </p>
        </div>

        <AdminShipmentsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          total={shipmentsQuery.data?.total}
        />

        {shipmentsQuery.isError ? (
          <AdminShipmentsError onRetry={() => void shipmentsQuery.refetch()} />
        ) : (
          <AdminShipmentsTable rows={tableRows} loading={shipmentsQuery.isLoading} />
        )}
      </div>
    </AdminPageConfig>
  )
}
