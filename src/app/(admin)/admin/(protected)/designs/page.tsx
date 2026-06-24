'use client'

import { useDeferredValue, useMemo, useState } from 'react'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  AdminDesignDetailDialog,
  AdminDesignsError,
  AdminDesignsTable,
  AdminDesignsToolbar,
} from '@/src/features/admin/designs'
import { useAdminDesignsQuery } from '@/src/features/admin/designs/api/use-admin-designs-query'
import {
  buildAdminDesignsListVariables,
  mapAdminDesignListItemToTableRow,
} from '@/src/features/admin/designs/mappers/admin-designs-ui.mapper'
import type {
  AdminDesignOwnerFilter,
  AdminDesignStatusFilter,
} from '@/src/features/admin/designs/types'

export default function AdminDesignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<AdminDesignStatusFilter>('all')
  const [ownerFilter, setOwnerFilter] = useState<AdminDesignOwnerFilter>('all')
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const listVariables = useMemo(
    () =>
      buildAdminDesignsListVariables({
        search: deferredSearch,
        statusFilter,
        ownerFilter,
        limit: 50,
        offset: 0,
      }),
    [deferredSearch, statusFilter, ownerFilter],
  )

  const designsQuery = useAdminDesignsQuery(listVariables)

  const tableRows = useMemo(
    () => (designsQuery.data?.items ?? []).map(mapAdminDesignListItemToTableRow),
    [designsQuery.data?.items],
  )

  const openDesignDetail = (designId: string) => {
    setSelectedDesignId(designId)
    setDetailOpen(true)
  }

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Diseños' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Diseños</h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Inspecciona diseños guardados y su personalización.
          </p>
        </div>

        <AdminDesignsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          total={designsQuery.data?.total}
        />

        {designsQuery.isError ? (
          <AdminDesignsError onRetry={() => void designsQuery.refetch()} />
        ) : (
          <AdminDesignsTable
            rows={tableRows}
            loading={designsQuery.isLoading}
            onRowClick={openDesignDetail}
          />
        )}

        <AdminDesignDetailDialog
          designId={selectedDesignId}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </AdminPageConfig>
  )
}
