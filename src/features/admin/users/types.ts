export type AdminUser = {
  id: string
  name: string
  email: string
  roles: string[]
  status: string
  customerTier: string
  emailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminUsersPayload = {
  items: AdminUser[]
  total: number
}

export type AdminUsersFilter = {
  search?: string | null
  role?: string | null
  status?: string | null
}

export type AdminUsersListVariables = {
  filter?: AdminUsersFilter | null
  limit?: number | null
  offset?: number | null
}

export type AdminUserRoleFilter = 'all' | 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN'

export type AdminUserStatusFilter = 'all' | 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'

export type AdminUsersUiTableRow = {
  id: string
  name: string
  email: string
  rolesLabel: string
  roles: string[]
  status: string
  statusLabel: string
  customerTier: string
  customerTierLabel: string | null
  emailVerified: boolean
  isActive: boolean
  createdAtLabel: string
  updatedAtLabel: string
}
