import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type {
  AdminUserInvitationStatusFilter,
  AdminUserInvitationsListVariables,
  AdminUserInvitationsUiTableRow,
  UserInvitation,
} from '../types/admin-invitations.types'

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Admin',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REVOKED: 'Revocada',
  EXPIRED: 'Expirada',
}

function formatAdminDate(iso: string): string {
  try {
    return format(new Date(iso), 'd MMM yyyy, HH:mm', { locale: es })
  } catch {
    return iso
  }
}

export function buildAdminInvitationsListVariables(input: {
  search: string
  statusFilter: AdminUserInvitationStatusFilter
  limit?: number
  offset?: number
}): AdminUserInvitationsListVariables {
  const search = input.search.trim()

  return {
    filter: {
      ...(search ? { search } : {}),
      ...(input.statusFilter !== 'all' ? { status: input.statusFilter } : {}),
    },
    limit: input.limit ?? 50,
    offset: input.offset ?? 0,
  }
}

export function mapUserInvitationToTableRow(
  invitation: UserInvitation,
): AdminUserInvitationsUiTableRow {
  const isPending = invitation.status === 'PENDING'

  return {
    id: invitation.id,
    email: invitation.email,
    targetRole: invitation.targetRole,
    targetRoleLabel: ROLE_LABELS[invitation.targetRole] ?? invitation.targetRole,
    status: invitation.status,
    statusLabel: STATUS_LABELS[invitation.status] ?? invitation.status,
    invitedByName: invitation.invitedBy?.name ?? '—',
    createdAtLabel: formatAdminDate(invitation.createdAt),
    expiresAtLabel: formatAdminDate(invitation.expiresAt),
    canRevoke: isPending,
    canResend: isPending,
  }
}
