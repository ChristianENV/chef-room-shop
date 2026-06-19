'use client'

import { Ruler } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../../store/customizer.store'
import { FALLBACK_SIZES } from '../../lib/customizer-defaults'
import { findColorByHex, findSizeByLabel } from '../../lib/resolve-customizer-variant'
import type { Size } from '../../types/customizer.types'

const SIZE_GUIDE: { size: string; chest: string; length: string }[] = [
  { size: 'XS', chest: '88–92 cm', length: '68 cm' },
  { size: 'S', chest: '92–98 cm', length: '70 cm' },
  { size: 'M', chest: '98–104 cm', length: '72 cm' },
  { size: 'L', chest: '104–110 cm', length: '74 cm' },
  { size: 'XL', chest: '110–116 cm', length: '76 cm' },
  { size: 'XXL', chest: '116–122 cm', length: '78 cm' },
]

export function SizeSection({ embedded = false }: { embedded?: boolean }) {
  const { product, size, baseColor, setSize } = useCustomizerStore()

  if (!product) {
    return (
      <div className="p-4 text-xs text-muted-foreground" data-testid="customizer-size-options">
        Cargando tallas del producto…
      </div>
    )
  }

  const requiresVariant = product.variants.length > 0
  const bffSizes = product.sizes
  const sizes: { id: string; name: Size }[] =
    bffSizes.length > 0
      ? bffSizes.map((item) => ({ id: item.id, name: item.name as Size }))
      : requiresVariant
        ? []
        : FALLBACK_SIZES.map((name) => ({ id: name, name }))

  const selectedColorId = findColorByHex(product.colors, baseColor)?.id ?? null
  const selectedSizeRow = findSizeByLabel(product.sizes, size)

  const isOutOfStock = (sizeId: string): boolean => {
    if (!product || product.variants.length === 0) return false
    const variants = product.variants.filter(
      (variant) =>
        variant.sizeId === sizeId &&
        (selectedColorId ? variant.colorId === selectedColorId : true) &&
        variant.isActive,
    )
    if (variants.length === 0) return false
    return variants.every((variant) => variant.stockQty <= 0)
  }

  return (
    <div
      className={embedded ? 'space-y-3 px-1 pb-2' : 'space-y-3 p-4'}
      data-testid="customizer-size-options"
    >
      <div className="flex items-center justify-between">
        {!embedded ? (
          <div>
            <h3 className="text-sm font-semibold text-foreground">Talla</h3>
            <p className="text-xs text-muted-foreground">Elige tu talla.</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Elige tu talla.</p>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Ruler className="size-3.5" />
              Guía de tallas
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Guía de tallas</DialogTitle>
              <DialogDescription>Medidas aproximadas en centímetros.</DialogDescription>
            </DialogHeader>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-2">Talla</th>
                  <th className="py-2">Pecho</th>
                  <th className="py-2">Largo</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => (
                  <tr key={row.size} className="border-b border-border/40">
                    <td className="py-2 font-medium">{row.size}</td>
                    <td className="py-2 text-muted-foreground">{row.chest}</td>
                    <td className="py-2 text-muted-foreground">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sizes.map((item) => {
          const disabled = isOutOfStock(item.id)
          const selected = selectedSizeRow ? selectedSizeRow.id === item.id : size === item.name
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => setSize(item.name)}
              data-testid={`customizer-size-option-${item.name.toLowerCase()}`}
              className={cn(
                'flex h-11 items-center justify-center rounded-lg border text-sm font-medium transition',
                selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary/50',
                disabled &&
                  'cursor-not-allowed border-border/40 text-muted-foreground/40 line-through hover:border-border/40',
              )}
            >
              {item.name}
            </button>
          )
        })}
      </div>
      {requiresVariant && bffSizes.length === 0 ? (
        <p className="text-[11px] text-destructive/80">
          Este producto no tiene tallas configuradas en catálogo.
        </p>
      ) : null}
    </div>
  )
}
