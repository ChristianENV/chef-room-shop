'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Mas populares' },
  { value: 'newest', label: 'Nuevos' },
  { value: 'price-asc', label: 'Precio menor a mayor' },
  { value: 'price-desc', label: 'Precio mayor a menor' },
  { value: 'rating', label: 'Mejor valorados' },
]

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-[180px] bg-card font-serif text-sm">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="font-serif text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
