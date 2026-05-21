'use client'

import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SelectOption } from './types/admin-products-ui.types'

interface ProductsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  productTypeSlug: string
  onProductTypeChange: (value: string) => void
  productTypeOptions: SelectOption[]
  statusFilter: string
  onStatusChange: (value: string) => void
  customizableOnly: boolean
  onCustomizableChange: (value: boolean) => void
  sortBy: string
  onSortChange: (value: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function ProductsToolbar({
  search,
  onSearchChange,
  productTypeSlug,
  onProductTypeChange,
  productTypeOptions,
  statusFilter,
  onStatusChange,
  customizableOnly,
  onCustomizableChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 font-sans"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={productTypeSlug} onValueChange={onProductTypeChange}>
          <SelectTrigger className="w-[150px] font-sans">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {productTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[130px] font-sans">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ACTIVE">Activo</SelectItem>
            <SelectItem value="DRAFT">Borrador</SelectItem>
            <SelectItem value="ARCHIVED">Archivado</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            id="customizable"
            checked={customizableOnly}
            onCheckedChange={(checked) => onCustomizableChange(checked === true)}
          />
          <Label htmlFor="customizable" className="cursor-pointer font-sans text-sm">
            Personalizables
          </Label>
        </div>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px] font-sans">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Más recientes</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre Z-A</SelectItem>
            <SelectItem value="price">Precio menor</SelectItem>
            <SelectItem value="price-desc">Precio mayor</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" className="gap-1 font-sans" onClick={onClearFilters}>
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        ) : null}
      </div>
    </div>
  )
}
