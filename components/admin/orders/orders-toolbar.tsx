'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, Plus, Calendar } from 'lucide-react'
import type { AdminOrderStatus, AdminPaymentStatus, AdminProductionStatus } from '@/lib/types'

interface OrdersToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: AdminOrderStatus | 'all'
  onStatusFilterChange: (value: AdminOrderStatus | 'all') => void
  paymentFilter: AdminPaymentStatus | 'all'
  onPaymentFilterChange: (value: AdminPaymentStatus | 'all') => void
  productionFilter: AdminProductionStatus | 'all'
  onProductionFilterChange: (value: AdminProductionStatus | 'all') => void
  onExport: () => void
  onCreateManual: () => void
}

export function OrdersToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  productionFilter,
  onProductionFilterChange,
  onExport,
  onCreateManual,
}: OrdersToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Row - Search and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID, cliente o email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 font-sans"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" onClick={onCreateManual}>
            <Plus className="mr-2 h-4 w-4" />
            Crear orden manual
          </Button>
        </div>
      </div>

      {/* Bottom Row - Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as AdminOrderStatus | 'all')}
        >
          <SelectTrigger className="w-[160px] font-sans">
            <SelectValue placeholder="Estado orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente-pago">Pendiente pago</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
            <SelectItem value="en-produccion">En produccion</SelectItem>
            <SelectItem value="listo-envio">Listo envio</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentFilter}
          onValueChange={(v) => onPaymentFilterChange(v as AdminPaymentStatus | 'all')}
        >
          <SelectTrigger className="w-[160px] font-sans">
            <SelectValue placeholder="Estado pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pagos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
            <SelectItem value="fallido">Fallido</SelectItem>
            <SelectItem value="reembolsado">Reembolsado</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={productionFilter}
          onValueChange={(v) => onProductionFilterChange(v as AdminProductionStatus | 'all')}
        >
          <SelectTrigger className="w-[160px] font-sans">
            <SelectValue placeholder="Produccion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda produccion</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en-cola">En cola</SelectItem>
            <SelectItem value="en-proceso">En proceso</SelectItem>
            <SelectItem value="revision">Revision</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Placeholder */}
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Rango de fechas</span>
        </Button>
      </div>
    </div>
  )
}
