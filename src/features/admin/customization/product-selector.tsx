'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductCategory } from '@/lib/types'
import { MOCK_ADMIN_PRODUCTS } from '@/lib/mock-data'

interface ProductSelectorProps {
  selectedType: ProductCategory | 'all'
  selectedProductId: string | null
  onTypeChange: (type: ProductCategory | 'all') => void
  onProductChange: (productId: string | null) => void
}

const productTypes: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'filipinas', label: 'Filipinas' },
  { value: 'mandiles', label: 'Mandiles' },
  { value: 'pantalones', label: 'Pantalones' },
]

export function ProductSelector({
  selectedType,
  selectedProductId,
  onTypeChange,
  onProductChange,
}: ProductSelectorProps) {
  // Filter products by type
  const filteredProducts = selectedType === 'all'
    ? MOCK_ADMIN_PRODUCTS.filter(p => p.customizable)
    : MOCK_ADMIN_PRODUCTS.filter(p => p.category === selectedType && p.customizable)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label className="font-sans text-sm font-medium">Tipo de Prenda</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => {
            onTypeChange(value as ProductCategory | 'all')
            onProductChange(null)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona tipo" />
          </SelectTrigger>
          <SelectContent>
            {productTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label className="font-sans text-sm font-medium">Producto Especifico</Label>
        <Select
          value={selectedProductId ?? 'none'}
          onValueChange={(value) => onProductChange(value === 'none' ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona producto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Todos los productos</SelectItem>
            {filteredProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
