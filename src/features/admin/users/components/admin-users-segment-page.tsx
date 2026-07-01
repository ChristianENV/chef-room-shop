'use client'

import { useDeferredValue, useMemo, useState } from 'react'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { useAdminUsersQuery } from '../api/use-admin-users-query'
import { usePauseAdminUserMutation } from '../api/use-pause-admin-user-mutation'
import { useBlockAdminUserMutation } from '../api/use-block-admin-user-mutation'
import { useReactivateAdminUserMutation } from '../api/use-reactivate-admin-user-mutation'
import {
  buildAdminUsersListVariables,
  mapAdminUserToTableRow,
} from '../mappers/admin-users-ui.mapper'
import type { AdminUserSegment, AdminUserStatusFilter, AdminUsersUiTableRow } from '../types'

import { AdminUsersToolbar } from './admin-users-toolbar'
import { AdminUsersTable } from './admin-users-table'
import { AdminUsersError } from './admin-users-error'
import { AdminUsersSegmentTabs } from './admin-users-segment-tabs'
import { AdminUserEditDialog } from './admin-user-edit-dialog'
import { AdminUserActionDialog } from './admin-user-action-dialog'
import type { AdminUserTableAction } from './admin-users-table'
import type { AdminUserActionType } from './admin-user-action-dialog'

type DialogState =
  | { type: 'edit'; row: AdminUsersUiTableRow }
  | { type: 'pause' | 'block' | 'reactivate'; row: AdminUsersUiTableRow }
  | null

type AdminUsersSegmentPageProps = {
  segment: AdminUserSegment
  title: string
  description: string
  /** If true, show customerTier field in the edit dialog. */
  showCustomerTier?: boolean
  /** If true, show the Blocked status filter option. */
  showDeletedStatus?: boolean
  canWrite: boolean
}

export function AdminUsersSegmentPage({
  segment,
  title,
  description,
  showCustomerTier = false,
  showDeletedStatus = false,
  canWrite,
}: AdminUsersSegmentPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<AdminUserStatusFilter>('all')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const pauseMutation = usePauseAdminUserMutation()
  const blockMutation = useBlockAdminUserMutation()
  const reactivateMutation = useReactivateAdminUserMutation()

  const listVariables = useMemo(
    () =>
      buildAdminUsersListVariables({
        search: deferredSearch,
        statusFilter,
        limit: 50,
        offset: 0,
        segment,
      }),
    [deferredSearch, statusFilter, segment],
  )

  const usersQuery = useAdminUsersQuery(listVariables)

  const tableRows = useMemo(
    () => (usersQuery.data?.items ?? []).map(mapAdminUserToTableRow),
    [usersQuery.data?.items],
  )

  function handleAction(action: AdminUserTableAction, userId: string) {
    const row = tableRows.find((r) => r.id === userId)
    if (!row) return
    setActionError(null)
    setDialog({ type: action, row })
  }

  function handleCloseDialog() {
    if (pauseMutation.isPending || blockMutation.isPending || reactivateMutation.isPending) return
    setDialog(null)
    setActionError(null)
  }

  async function handleActionConfirm() {
    if (!dialog) return
    const { type, row } = dialog

    setActionError(null)
    try {
      if (type === 'pause') {
        await pauseMutation.mutateAsync(row.id)
      } else if (type === 'block') {
        await blockMutation.mutateAsync(row.id)
      } else if (type === 'reactivate') {
        await reactivateMutation.mutateAsync(row.id)
      }
      setDialog(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error.'
      setActionError(message)
    }
  }

  const actionIsPending =
    pauseMutation.isPending || blockMutation.isPending || reactivateMutation.isPending

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Usuarios' }, { label: title }]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Usuarios</h1>
          <p className="mt-1 font-serif text-muted-foreground">{description}</p>
        </div>

        <AdminUsersSegmentTabs />

        <AdminUsersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          total={usersQuery.data?.total}
          showDeletedStatus={showDeletedStatus}
        />

        {usersQuery.isError ? (
          <AdminUsersError onRetry={() => void usersQuery.refetch()} />
        ) : (
          <AdminUsersTable
            rows={tableRows}
            loading={usersQuery.isLoading}
            onAction={canWrite ? handleAction : undefined}
            canWrite={canWrite}
          />
        )}
      </div>

      {/* Edit dialog */}
      {dialog?.type === 'edit' ? (
        <AdminUserEditDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          user={dialog.row}
          showCustomerTier={showCustomerTier}
          onSaved={() => setDialog(null)}
        />
      ) : null}

      {/* Pause / block / reactivate dialog */}
      {dialog && dialog.type !== 'edit' ? (
        <AdminUserActionDialog
          open
          onOpenChange={(open) => {
            if (!open) handleCloseDialog()
          }}
          actionType={dialog.type as AdminUserActionType}
          userName={dialog.row.name}
          onConfirm={() => void handleActionConfirm()}
          isPending={actionIsPending}
          errorMessage={actionError}
        />
      ) : null}
    </AdminPageConfig>
  )
}
