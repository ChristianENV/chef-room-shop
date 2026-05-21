'use client'

import { Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminCustomizationProduct } from './types'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  DRAFT: 'Borrador',
  ARCHIVED: 'Archivado',
}

type ProductSelectorProps = {
  products: AdminCustomizationProduct[]
  selectedProductId: string | null
  search: string
  onSearchChange: (value: string) => void
  onProductChange: (productId: string | null) => void
  isLoading?: boolean
}

export function ProductSelector({
  products,
  selectedProductId,
  search,
  onSearchChange,
  onProductChange,
  isLoading,
}: ProductSelectorProps) {
  const selected = products.find((p) => p.id === selectedProductId) ?? null

  const filtered = search.trim()
    ? products.filter((p) => {
        const term = search.trim().toLowerCase()
        return (
          p.name.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term) ||
          (p.productTypeName?.toLowerCase().includes(term) ?? false)
        )
      })
    : products

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-2">
          <Label className="font-sans text-sm font-medium">Buscar producto</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Nombre o slug..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 font-sans"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <Label className="font-sans text-sm font-medium">Producto</Label>
          <Select
            value={selectedProductId ?? 'none'}
            onValueChange={(v) => onProductChange(v === 'none' ? null : v)}
            disabled={isLoading || filtered.length === 0}
          >
            <SelectTrigger className="w-full font-sans">
              <SelectValue placeholder="Selecciona producto" />
            </SelectTrigger>
            <SelectContent>
              {filtered.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selected ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="font-sans text-sm font-medium text-foreground">{selected.name}</span>
          {selected.productTypeName ? (
            <Badge variant="outline" className="font-sans text-xs">
              {selected.productTypeName}
            </Badge>
          ) : null}
          <Badge variant="secondary" className="font-sans text-xs">
            {STATUS_LABELS[selected.status] ?? selected.status}
          </Badge>
          {selected.customizable ? (
            <Badge className="font-sans text-xs">Personalizable</Badge>
          ) : (
            <Badge variant="outline" className="font-sans text-xs">
              No personalizable
            </Badge>
          )}
        </div>
      ) : null}
    </div>
  )
}
