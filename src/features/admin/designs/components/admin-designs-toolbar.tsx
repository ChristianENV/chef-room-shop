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

import type { AdminDesignOwnerFilter, AdminDesignStatusFilter } from '../types'

type AdminDesignsToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: AdminDesignStatusFilter
  onStatusFilterChange: (value: AdminDesignStatusFilter) => void
  ownerFilter: AdminDesignOwnerFilter
  onOwnerFilterChange: (value: AdminDesignOwnerFilter) => void
  total?: number
}

export function AdminDesignsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  total,
}: AdminDesignsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID, nombre o cliente..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 font-sans"
            data-testid="admin-designs-search"
          />
        </div>
        {typeof total === 'number' ? (
          <p className="font-serif text-sm text-muted-foreground">
            {total} diseño{total === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as AdminDesignStatusFilter)}
        >
          <SelectTrigger className="w-[220px] font-sans" data-testid="admin-designs-status-filter">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="DRAFT">Borrador</SelectItem>
            <SelectItem value="SAVED">Guardado</SelectItem>
            <SelectItem value="IN_CART">En carrito</SelectItem>
            <SelectItem value="PURCHASED">Comprado</SelectItem>
            <SelectItem value="ABANDONED">Abandonado</SelectItem>
            <SelectItem value="ARCHIVED">Archivado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={ownerFilter}
          onValueChange={(value) => onOwnerFilterChange(value as AdminDesignOwnerFilter)}
        >
          <SelectTrigger className="w-[200px] font-sans" data-testid="admin-designs-owner-filter">
            <SelectValue placeholder="Propietario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="USER">Usuario registrado</SelectItem>
            <SelectItem value="GUEST">Invitado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
