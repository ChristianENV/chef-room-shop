export type AdminUser = {
  id: string
  name: string
  email: string
  roles: string[]
  status: string
  customerTier: string
  emailVerified: boolean
  isActive: boolean
  firstName: string | null
  lastName: string | null
  phone: string | null
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
  segment?: string | null
}

export type AdminUsersListVariables = {
  filter?: AdminUsersFilter | null
  limit?: number | null
  offset?: number | null
}

export type AdminUserRoleFilter = 'all' | 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN'

export type AdminUserStatusFilter =
  | 'all'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'PENDING_VERIFICATION'
  | 'DELETED'

/** Which tab/segment is being displayed */
export type AdminUserSegment = 'CUSTOMERS' | 'ADMINS'

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
  firstName: string | null
  lastName: string | null
  phone: string | null
  createdAtLabel: string
  updatedAtLabel: string
}

export type UpdateAdminUserInput = {
  id: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  customerTier?: string | null
}
