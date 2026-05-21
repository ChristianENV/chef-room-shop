'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Download, Plus } from 'lucide-react'

import type {
  AdminOrderStatusFilter,
  AdminPaymentStatusFilter,
} from './types/admin-orders-ui.types'

interface OrdersToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: AdminOrderStatusFilter | 'all'
  onStatusFilterChange: (value: AdminOrderStatusFilter | 'all') => void
  paymentFilter: AdminPaymentStatusFilter | 'all'
  onPaymentFilterChange: (value: AdminPaymentStatusFilter | 'all') => void
  productionOnly: boolean
  onProductionOnlyChange: (value: boolean) => void
}

export function OrdersToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  productionOnly,
  onProductionOnlyChange,
}: OrdersToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número, cliente o email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 font-sans"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Exportación CSV — próximamente"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button
            size="sm"
            disabled
            title="Creación manual de órdenes — próximamente"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear orden manual
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as AdminOrderStatusFilter | 'all')}
        >
          <SelectTrigger className="w-[180px] font-sans">
            <SelectValue placeholder="Estado de orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente-pago">Pendiente de pago</SelectItem>
            <SelectItem value="pagado">Pagada</SelectItem>
            <SelectItem value="en-produccion">En producción</SelectItem>
            <SelectItem value="listo-envio">Lista para envío</SelectItem>
            <SelectItem value="enviado">Enviada</SelectItem>
            <SelectItem value="entregado">Entregada</SelectItem>
            <SelectItem value="cancelado">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentFilter}
          onValueChange={(v) => onPaymentFilterChange(v as AdminPaymentStatusFilter | 'all')}
        >
          <SelectTrigger className="w-[160px] font-sans">
            <SelectValue placeholder="Estado pago" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pagos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="completado">Pagado</SelectItem>
            <SelectItem value="fallido">Fallido</SelectItem>
            <SelectItem value="reembolsado">Reembolsado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <Switch
            id="production-only"
            checked={productionOnly}
            onCheckedChange={onProductionOnlyChange}
          />
          <Label htmlFor="production-only" className="cursor-pointer font-sans text-sm">
            Solo pipeline de producción
          </Label>
        </div>
      </div>
    </div>
  )
}
