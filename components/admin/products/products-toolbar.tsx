'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface ProductsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  customizableOnly: boolean
  onCustomizableChange: (value: boolean) => void
  sortBy: string
  onSortChange: (value: string) => void
}

export function ProductsToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  customizableOnly,
  onCustomizableChange,
  sortBy,
  onSortChange,
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[140px] font-sans">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="filipinas">Filipinas</SelectItem>
            <SelectItem value="mandiles">Mandiles</SelectItem>
            <SelectItem value="pantalones">Pantalones</SelectItem>
            <SelectItem value="accesorios">Accesorios</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[130px] font-sans">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="archivado">Archivado</SelectItem>
          </SelectContent>
        </Select>

        {/* Customizable Toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="customizable"
            checked={customizableOnly}
            onCheckedChange={(checked) => onCustomizableChange(checked === true)}
          />
          <Label htmlFor="customizable" className="font-sans text-sm cursor-pointer">
            Personalizables
          </Label>
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px] font-sans">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Mas recientes</SelectItem>
            <SelectItem value="name">Nombre A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre Z-A</SelectItem>
            <SelectItem value="price">Precio menor</SelectItem>
            <SelectItem value="price-desc">Precio mayor</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
