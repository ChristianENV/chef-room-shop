'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { SlidersHorizontal, X } from 'lucide-react'

export interface FilterState {
  categories: string[]
  sizes: string[]
  colors: string[]
  priceRange: [number, number]
  customizable: boolean | null
  productionTime: string[]
  materials: string[]
}

interface CatalogFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

const CATEGORIES = [
  { id: 'filipinas', label: 'Filipinas' },
  { id: 'mandiles', label: 'Mandiles' },
  { id: 'pantalones', label: 'Pantalones' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const COLORS = [
  { id: 'white', label: 'Blanco', hex: '#FFFFFF' },
  { id: 'black', label: 'Negro', hex: '#111111' },
  { id: 'navy', label: 'Azul Marino', hex: '#0B1026' },
  { id: 'gray', label: 'Gris', hex: '#6B7280' },
  { id: 'charcoal', label: 'Carbon', hex: '#374151' },
]

const PRODUCTION_TIMES = [
  { id: '3-5', label: '3-5 dias' },
  { id: '5-7', label: '5-7 dias' },
  { id: '7-10', label: '7-10 dias' },
]

const MATERIALS = [
  { id: 'algodon', label: 'Algodon' },
  { id: 'poliester', label: 'Poliester' },
  { id: 'mezcla', label: 'Mezcla' },
]

function FilterContent({ filters, onFiltersChange }: CatalogFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: 'categories' | 'sizes' | 'colors' | 'productionTime' | 'materials', value: string) => {
    const current = filters[key]
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateFilter(key, updated)
  }

  return (
    <div className="space-y-1">
      <Accordion type="multiple" defaultValue={['categoria', 'talla', 'color', 'precio']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="categoria">
          <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline">
            Categoria
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={filters.categories.includes(cat.id)}
                    onCheckedChange={() => toggleArrayFilter('categories', cat.id)}
                  />
                  <Label
                    htmlFor={`cat-${cat.id}`}
                    className="cursor-pointer font-serif text-sm text-foreground"
                  >
                    {cat.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size Filter */}
        <AccordionItem value="talla">
          <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline">
            Talla
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-1">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleArrayFilter('sizes', size)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 font-sans text-xs font-medium transition-colors',
                    filters.sizes.includes(size)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/50'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Color Filter */}
        <AccordionItem value="color">
          <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline">
            Color
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-1">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => toggleArrayFilter('colors', color.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors',
                    filters.colors.includes(color.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                  title={color.label}
                >
                  <div
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="font-serif text-xs text-foreground">{color.label}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="precio">
          <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline">
            Rango de precio
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-1">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                min={0}
                max={3000}
                step={100}
                className="w-full"
              />
              <div className="flex items-center justify-between font-serif text-sm text-muted-foreground">
                <span>${filters.priceRange[0].toLocaleString('es-MX')}</span>
                <span>${filters.priceRange[1].toLocaleString('es-MX')}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Customizable Filter */}
        <AccordionItem value="personalizable">
          <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline">
            Personalizable
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="customizable-yes"
                  checked={filters.customizable === true}
                  onCheckedChange={(checked) => 
                    updateFilter('customizable', checked ? true : null)
                  }
                />
                <Label
                  htmlFor="customizable-yes"
                  className="cursor-pointer font-serif text-sm text-foreground"
                >
                  Solo personalizables
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Production Time Filter */}
        <AccordionItem value="tiempo">
          <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline">
            Tiempo de produccion
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {PRODUCTION_TIMES.map((time) => (
                <div key={time.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`time-${time.id}`}
                    checked={filters.productionTime.includes(time.id)}
                    onCheckedChange={() => toggleArrayFilter('productionTime', time.id)}
                  />
                  <Label
                    htmlFor={`time-${time.id}`}
                    className="cursor-pointer font-serif text-sm text-foreground"
                  >
                    {time.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Material Filter */}
        <AccordionItem value="material">
          <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline">
            Material
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {MATERIALS.map((material) => (
                <div key={material.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`material-${material.id}`}
                    checked={filters.materials.includes(material.id)}
                    onCheckedChange={() => toggleArrayFilter('materials', material.id)}
                  />
                  <Label
                    htmlFor={`material-${material.id}`}
                    className="cursor-pointer font-serif text-sm text-foreground"
                  >
                    {material.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

// Desktop Sidebar Filters
export function CatalogFilters({ filters, onFiltersChange, className }: CatalogFiltersProps) {
  return (
    <aside className={cn('hidden w-64 flex-shrink-0 lg:block', className)}>
      <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-base font-semibold text-foreground">Filtros</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 font-serif text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onFiltersChange({
              categories: [],
              sizes: [],
              colors: [],
              priceRange: [0, 3000],
              customizable: null,
              productionTime: [],
              materials: [],
            })}
          >
            Limpiar
          </Button>
        </div>
        <Separator className="mb-4" />
        <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
      </div>
    </aside>
  )
}

// Mobile Filters Sheet
interface MobileFiltersSheetProps extends CatalogFiltersProps {
  activeFilterCount: number
}

export function MobileFiltersSheet({ 
  filters, 
  onFiltersChange, 
  activeFilterCount 
}: MobileFiltersSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-sans">Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </div>
        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onFiltersChange({
                categories: [],
                sizes: [],
                colors: [],
                priceRange: [0, 3000],
                customizable: null,
                productionTime: [],
                materials: [],
              })
            }}
          >
            Limpiar filtros
          </Button>
          <Button className="w-full" onClick={() => setOpen(false)}>
            Ver resultados
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// Active Filters Chips
interface ActiveFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function ActiveFilters({ filters, onFiltersChange }: ActiveFiltersProps) {
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = []

  // Categories
  filters.categories.forEach((cat) => {
    const category = CATEGORIES.find((c) => c.id === cat)
    if (category) {
      activeFilters.push({
        key: `cat-${cat}`,
        label: category.label,
        onRemove: () => onFiltersChange({
          ...filters,
          categories: filters.categories.filter((c) => c !== cat),
        }),
      })
    }
  })

  // Sizes
  filters.sizes.forEach((size) => {
    activeFilters.push({
      key: `size-${size}`,
      label: `Talla ${size}`,
      onRemove: () => onFiltersChange({
        ...filters,
        sizes: filters.sizes.filter((s) => s !== size),
      }),
    })
  })

  // Colors
  filters.colors.forEach((color) => {
    const colorObj = COLORS.find((c) => c.id === color)
    if (colorObj) {
      activeFilters.push({
        key: `color-${color}`,
        label: colorObj.label,
        onRemove: () => onFiltersChange({
          ...filters,
          colors: filters.colors.filter((c) => c !== color),
        }),
      })
    }
  })

  // Customizable
  if (filters.customizable === true) {
    activeFilters.push({
      key: 'customizable',
      label: 'Personalizable',
      onRemove: () => onFiltersChange({ ...filters, customizable: null }),
    })
  }

  // Price range (only if changed from default)
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 3000) {
    activeFilters.push({
      key: 'price',
      label: `$${filters.priceRange[0].toLocaleString('es-MX')} - $${filters.priceRange[1].toLocaleString('es-MX')}`,
      onRemove: () => onFiltersChange({ ...filters, priceRange: [0, 3000] }),
    })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={filter.onRemove}
          className="group flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 transition-colors hover:border-destructive/50 hover:bg-destructive/10"
        >
          <span className="font-serif text-xs text-foreground">{filter.label}</span>
          <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive" />
        </button>
      ))}
      <button
        onClick={() => onFiltersChange({
          categories: [],
          sizes: [],
          colors: [],
          priceRange: [0, 3000],
          customizable: null,
          productionTime: [],
          materials: [],
        })}
        className="font-sans text-xs font-medium text-primary hover:underline"
      >
        Limpiar todo
      </button>
    </div>
  )
}

// Export filter constants for use elsewhere
export { CATEGORIES, SIZES, COLORS, PRODUCTION_TIMES, MATERIALS }
