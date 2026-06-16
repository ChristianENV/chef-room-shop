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

import type { AdminPaymentStatusFilter } from '../types'

type AdminPaymentsToolbarProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: AdminPaymentStatusFilter
  onStatusFilterChange: (value: AdminPaymentStatusFilter) => void
  total?: number
}

export function AdminPaymentsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  total,
}: AdminPaymentsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por orden o cliente..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9 font-sans"
            data-testid="admin-payments-search"
          />
        </div>
        {typeof total === 'number' ? (
          <p className="font-serif text-sm text-muted-foreground">
            {total} pago{total === 1 ? '' : 's'}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as AdminPaymentStatusFilter)}
        >
          <SelectTrigger className="w-[220px] font-sans" data-testid="admin-payments-status-filter">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="AUTHORIZED">Autorizado</SelectItem>
            <SelectItem value="PAID">Pagado</SelectItem>
            <SelectItem value="FAILED">Fallido</SelectItem>
            <SelectItem value="REFUNDED">Reembolsado</SelectItem>
            <SelectItem value="PARTIALLY_REFUNDED">Reembolso parcial</SelectItem>
            <SelectItem value="CANCELLED">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
