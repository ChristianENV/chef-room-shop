export type AdminUserGql = {
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

export type AdminUsersPayloadGql = {
  items: AdminUserGql[]
  total: number
}

export type AdminUsersFilterInput = {
  search?: string | null
  role?: string | null
  status?: string | null
}

export type AdminUsersListInput = {
  filter?: AdminUsersFilterInput | null
  limit?: number | null
  offset?: number | null
}
