'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

import type { AdminUserRoleFilter, AdminUserStatusFilter } from '../types'

type AdminUsersToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  roleFilter: AdminUserRoleFilter
  onRoleFilterChange: (value: AdminUserRoleFilter) => void
  statusFilter: AdminUserStatusFilter
  onStatusFilterChange: (value: AdminUserStatusFilter) => void
  total?: number
}

export function AdminUsersToolbar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  total,
}: AdminUsersToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 font-sans"
            data-testid="admin-users-search"
          />
        </div>
        {typeof total === 'number' ? (
          <p className="font-serif text-sm text-muted-foreground">
            {total} usuario{total === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={roleFilter}
          onValueChange={(value) => onRoleFilterChange(value as AdminUserRoleFilter)}
        >
          <SelectTrigger className="w-[180px] font-sans" data-testid="admin-users-role-filter">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="CUSTOMER">Cliente</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as AdminUserStatusFilter)}
        >
          <SelectTrigger className="w-[200px] font-sans" data-testid="admin-users-status-filter">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Activo</SelectItem>
            <SelectItem value="SUSPENDED">Suspendido</SelectItem>
            <SelectItem value="PENDING_VERIFICATION">Pendiente verificación</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
