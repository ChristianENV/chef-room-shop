export type AdminUserGql = {
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

export type AdminUsersPayloadGql = {
  items: AdminUserGql[]
  total: number
}

export type AdminUsersFilterInput = {
  search?: string | null
  role?: string | null
  status?: string | null
  /** 'CUSTOMERS' = users with no ADMIN/SUPERADMIN role. 'ADMINS' = users with ADMIN or SUPERADMIN role. */
  segment?: string | null
}

export type AdminUsersListInput = {
  filter?: AdminUsersFilterInput | null
  limit?: number | null
  offset?: number | null
}

export type UpdateAdminUserInput = {
  id: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  customerTier?: string | null
}
