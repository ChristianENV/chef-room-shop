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

import type { AdminShipmentStatusFilter } from '../types'

type AdminShipmentsToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: AdminShipmentStatusFilter
  onStatusFilterChange: (value: AdminShipmentStatusFilter) => void
  total?: number
}

export function AdminShipmentsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  total,
}: AdminShipmentsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por orden, cliente o rastreo..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 font-sans"
            data-testid="admin-shipments-search"
          />
        </div>
        {typeof total === 'number' ? (
          <p className="font-serif text-sm text-muted-foreground">
            {total} envío{total === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as AdminShipmentStatusFilter)}
        >
          <SelectTrigger
            className="w-[220px] font-sans"
            data-testid="admin-shipments-status-filter"
          >
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="LABEL_CREATED">Etiqueta creada</SelectItem>
            <SelectItem value="IN_TRANSIT">En tránsito</SelectItem>
            <SelectItem value="OUT_FOR_DELIVERY">En reparto</SelectItem>
            <SelectItem value="DELIVERED">Entregada</SelectItem>
            <SelectItem value="FAILED">Incidencia</SelectItem>
            <SelectItem value="RETURNED">Devuelta</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
