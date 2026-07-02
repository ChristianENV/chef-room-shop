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

function formatExpiresAtHint(status: string, expiresAt: string): string | null {
  if (status !== 'PENDING') return null

  const expires = new Date(expiresAt).getTime()
  const diffMs = expires - Date.now()
  if (diffMs <= 0) return 'Expirada'

  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
  if (days <= 1) return 'Expira hoy'
  if (days <= 7) return `Expira en ${days} días`
  return null
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
    expiresAtHint: formatExpiresAtHint(invitation.status, invitation.expiresAt),
    canRevoke: isPending,
    canResend: isPending,
  }
}
