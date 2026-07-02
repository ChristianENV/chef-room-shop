'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { useAdminUserInvitationsQuery } from '../api/use-admin-invitations-query'
import { useRevokeUserInvitationMutation } from '../api/use-revoke-user-invitation-mutation'
import { useResendUserInvitationMutation } from '../api/use-resend-user-invitation-mutation'
import {
  buildAdminInvitationsListVariables,
  mapUserInvitationToTableRow,
} from '../mappers/admin-invitations-ui.mapper'
import type { AdminUserInvitationStatusFilter } from '../types/admin-invitations.types'

import { AdminUsersSegmentTabs } from './admin-users-segment-tabs'
import { AdminUsersError } from './admin-users-error'
import { AdminInvitationsToolbar } from './admin-invitations-toolbar'
import { AdminInvitationsTable } from './admin-invitations-table'
import type { AdminInvitationTableAction } from './admin-invitations-table'
import { CreateUserInvitationDialog } from './create-user-invitation-dialog'
import {
  AdminInvitationActionDialog,
  type AdminInvitationActionType,
} from './admin-invitation-action-dialog'

type DialogState =
  | { type: 'create' }
  | { type: 'revoke' | 'resend'; invitationId: string; email: string }
  | null

type AdminInvitationsPageContentProps = {
  canWrite: boolean
}

export function AdminInvitationsPageContent({ canWrite }: AdminInvitationsPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<AdminUserInvitationStatusFilter>('all')
  const [dialog, setDialog] = useState<DialogState>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const revokeMutation = useRevokeUserInvitationMutation()
  const resendMutation = useResendUserInvitationMutation()

  const listVariables = useMemo(
    () =>
      buildAdminInvitationsListVariables({
        search: deferredSearch,
        statusFilter,
        limit: 50,
        offset: 0,
      }),
    [deferredSearch, statusFilter],
  )

  const invitationsQuery = useAdminUserInvitationsQuery(listVariables)

  const tableRows = useMemo(
    () => (invitationsQuery.data?.items ?? []).map(mapUserInvitationToTableRow),
    [invitationsQuery.data?.items],
  )

  function handleAction(action: AdminInvitationTableAction, invitationId: string) {
    const row = tableRows.find((r) => r.id === invitationId)
    if (!row) return
    setActionError(null)
    setDialog({ type: action, invitationId, email: row.email })
  }

  async function handleActionConfirm() {
    if (!dialog || dialog.type === 'create') return

    setActionError(null)
    try {
      if (dialog.type === 'revoke') {
        await revokeMutation.mutateAsync(dialog.invitationId)
      } else {
        await resendMutation.mutateAsync(dialog.invitationId)
      }
      setDialog(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error.'
      setActionError(message)
    }
  }

  const actionIsPending = revokeMutation.isPending || resendMutation.isPending

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Usuarios' }, { label: 'Invitaciones' }]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
              Usuarios
            </h1>
            <p className="mt-1 font-serif text-muted-foreground">
              Gestiona invitaciones enviadas a clientes y miembros del equipo.
            </p>
          </div>
          {canWrite ? (
            <Button
              className="font-sans"
              onClick={() => setCreateOpen(true)}
              data-testid="admin-invitations-new-button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva invitación
            </Button>
          ) : null}
        </div>

        <AdminUsersSegmentTabs />

        <AdminInvitationsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          total={invitationsQuery.data?.total}
        />

        {invitationsQuery.isError ? (
          <AdminUsersError onRetry={() => void invitationsQuery.refetch()} />
        ) : (
          <AdminInvitationsTable
            rows={tableRows}
            loading={invitationsQuery.isLoading}
            onAction={canWrite ? handleAction : undefined}
            canWrite={canWrite}
          />
        )}
      </div>

      {canWrite ? (
        <CreateUserInvitationDialog open={createOpen} onOpenChange={setCreateOpen} />
      ) : null}

      {dialog && dialog.type !== 'create' ? (
        <AdminInvitationActionDialog
          open
          onOpenChange={(open) => {
            if (!open && !actionIsPending) setDialog(null)
          }}
          actionType={dialog.type as AdminInvitationActionType}
          email={dialog.email}
          onConfirm={() => void handleActionConfirm()}
          isPending={actionIsPending}
          errorMessage={actionError}
        />
      ) : null}
    </AdminPageConfig>
  )
}
