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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  ADMIN_PRODUCTS_VISIBILITY_LABELS,
  type AdminProductsVisibilityFilter,
} from './lib/admin-products-list-filters'
import type { SelectOption } from './types/admin-products-ui.types'

interface ProductsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  productTypeSlug: string
  onProductTypeChange: (value: string) => void
  productTypeOptions: SelectOption[]
  visibilityFilter: AdminProductsVisibilityFilter
  onVisibilityChange: (value: AdminProductsVisibilityFilter) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  customizableOnly: boolean
  onCustomizableChange: (value: boolean) => void
  sortBy: string
  onSortChange: (value: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

function statusOptionsForVisibility(
  visibilityFilter: AdminProductsVisibilityFilter,
): Array<{ value: string; label: string }> {
  if (visibilityFilter === 'hidden') {
    return [{ value: 'ARCHIVED', label: 'Archivado' }]
  }

  if (visibilityFilter === 'all') {
    return [
      { value: 'all', label: 'Todos' },
      { value: 'ACTIVE', label: 'Activo' },
      { value: 'DRAFT', label: 'Borrador' },
      { value: 'ARCHIVED', label: 'Archivado' },
    ]
  }

  return [
    { value: 'ACTIVE', label: 'Activo' },
    { value: 'DRAFT', label: 'Borrador' },
  ]
}

export function ProductsToolbar({
  search,
  onSearchChange,
  productTypeSlug,
  onProductTypeChange,
  productTypeOptions,
  visibilityFilter,
  onVisibilityChange,
  statusFilter,
  onStatusChange,
  customizableOnly,
  onCustomizableChange,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: ProductsToolbarProps) {
  const statusOptions = statusOptionsForVisibility(visibilityFilter)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ToggleGroup
        type="single"
        variant="outline"
        value={visibilityFilter}
        onValueChange={(value) => {
          if (!value) return
          const next = value as AdminProductsVisibilityFilter
          onVisibilityChange(next)
          if (next === 'active') {
            onStatusChange('ACTIVE')
          } else if (next === 'hidden') {
            onStatusChange('ARCHIVED')
          }
        }}
        className="w-fit max-w-full"
        data-testid="admin-products-visibility-filter"
      >
        {(Object.keys(ADMIN_PRODUCTS_VISIBILITY_LABELS) as AdminProductsVisibilityFilter[]).map(
          (key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              aria-label={ADMIN_PRODUCTS_VISIBILITY_LABELS[key]}
              className="px-3 font-sans text-sm"
              data-testid={`admin-products-visibility-${key}`}
            >
              {ADMIN_PRODUCTS_VISIBILITY_LABELS[key]}
            </ToggleGroupItem>
          ),
        )}
      </ToggleGroup>

      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 w-full lg:max-w-sm lg:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 font-sans"
          />
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-3">
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

          {visibilityFilter !== 'hidden' ? (
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger
                className="w-[130px] font-sans"
                data-testid="admin-products-status-filter"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

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
    </div>
  )
}
