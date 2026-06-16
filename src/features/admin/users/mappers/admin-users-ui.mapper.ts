import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { getCustomerTierLabel } from '@/src/lib/customer/customer-tier'

import type {
  AdminUser,
  AdminUserRoleFilter,
  AdminUsersListVariables,
  AdminUserStatusFilter,
  AdminUsersUiTableRow,
} from '../types'

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Admin',
  SUPERADMIN: 'Superadmin',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
  PENDING_VERIFICATION: 'Pendiente',
  DELETED: 'Eliminado',
}

function formatAdminDate(iso: string): string {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return iso
  }
}

function formatRoles(roles: string[]): string {
  if (roles.length === 0) return 'Sin rol'
  return roles.map((role) => ROLE_LABELS[role] ?? role).join(', ')
}

export function buildAdminUsersListVariables(input: {
  search: string
  roleFilter: AdminUserRoleFilter
  statusFilter: AdminUserStatusFilter
  limit?: number
  offset?: number
}): AdminUsersListVariables {
  const search = input.search.trim()

  return {
    filter: {
      ...(search ? { search } : {}),
      ...(input.roleFilter !== 'all' ? { role: input.roleFilter } : {}),
      ...(input.statusFilter !== 'all' ? { status: input.statusFilter } : {}),
    },
    limit: input.limit ?? 50,
    offset: input.offset ?? 0,
  }
}

export function mapAdminUserToTableRow(user: AdminUser): AdminUsersUiTableRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    rolesLabel: formatRoles(user.roles),
    status: user.status,
    statusLabel: STATUS_LABELS[user.status] ?? user.status,
    customerTier: user.customerTier,
    customerTierLabel: getCustomerTierLabel(user.customerTier),
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    createdAtLabel: formatAdminDate(user.createdAt),
    updatedAtLabel: formatAdminDate(user.updatedAt),
  }
}
