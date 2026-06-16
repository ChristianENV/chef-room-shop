'use client'

import { useDeferredValue, useMemo, useState } from 'react'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  AdminUsersError,
  AdminUsersTable,
  AdminUsersToolbar,
} from '@/src/features/admin/users'
import { useAdminUsersQuery } from '@/src/features/admin/users/api/use-admin-users-query'
import {
  buildAdminUsersListVariables,
  mapAdminUserToTableRow,
} from '@/src/features/admin/users/mappers/admin-users-ui.mapper'
import type {
  AdminUserRoleFilter,
  AdminUserStatusFilter,
} from '@/src/features/admin/users/types'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('all')

  const listVariables = useMemo(
    () =>
      buildAdminUsersListVariables({
        search: deferredSearch,
        roleFilter,
        statusFilter,
        limit: 50,
        offset: 0,
      }),
    [deferredSearch, roleFilter, statusFilter],
  )

  const usersQuery = useAdminUsersQuery(listVariables)

  const tableRows = useMemo(
    () => (usersQuery.data?.items ?? []).map(mapAdminUserToTableRow),
    [usersQuery.data?.items],
  )

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Usuarios' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Usuarios
          </h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Consulta cuentas registradas, roles y estado de verificación.
          </p>
        </div>

        <AdminUsersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          total={usersQuery.data?.total}
        />

        {usersQuery.isError ? (
          <AdminUsersError onRetry={() => void usersQuery.refetch()} />
        ) : (
          <AdminUsersTable rows={tableRows} loading={usersQuery.isLoading} />
        )}
      </div>
    </AdminPageConfig>
  )
}
