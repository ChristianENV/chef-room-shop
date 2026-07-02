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

import type { AdminUserInvitationStatusFilter } from '../types/admin-invitations.types'

type AdminInvitationsToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: AdminUserInvitationStatusFilter
  onStatusFilterChange: (value: AdminUserInvitationStatusFilter) => void
  total?: number
}

export function AdminInvitationsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  total,
}: AdminInvitationsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por email..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 font-sans"
            data-testid="admin-invitations-search"
          />
        </div>
        {typeof total === 'number' ? (
          <p className="font-serif text-sm text-muted-foreground">
            {total} invitación{total === 1 ? '' : 'es'}
          </p>
        ) : null}
      </div>

      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as AdminUserInvitationStatusFilter)}
      >
        <SelectTrigger
          className="w-[200px] font-sans"
          data-testid="admin-invitations-status-filter"
        >
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="PENDING">Pendiente</SelectItem>
          <SelectItem value="ACCEPTED">Aceptada</SelectItem>
          <SelectItem value="REVOKED">Revocada</SelectItem>
          <SelectItem value="EXPIRED">Expirada</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
