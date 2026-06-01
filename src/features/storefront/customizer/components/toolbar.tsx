'use client'

import { RotateCcw, Scan, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomizerStore } from '../store/customizer.store'

interface TopToolbarProps {
  onSaveDesign?: () => void
  onAddToCart?: () => void
  isSaving?: boolean
  isAddingToCart?: boolean
  saveStatusLabel?: string
}

export function TopToolbar({
  onSaveDesign,
  onAddToCart,
  isSaving = false,
  isAddingToCart = false,
  saveStatusLabel = 'Demo tecnica',
}: TopToolbarProps) {
  return (
    <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3">
      <div />
      <div className="customizer-glass rounded-xl px-3 py-2 text-xs text-muted-foreground">
        {saveStatusLabel}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onSaveDesign}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar diseno'}
        </Button>
        <Button size="sm" onClick={onAddToCart} disabled={isAddingToCart}>
          {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}

export function ViewportControls() {
  const { viewMode, setViewMode, viewAngle, setViewAngle } = useCustomizerStore()

  return (
    <>
      <div className="customizer-glass absolute left-1/2 top-20 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl p-1">
        <button type="button" className="rounded-md px-3 py-1 text-xs" onClick={() => setViewMode('2D')}>
          2D
        </button>
        <button type="button" className="rounded-md px-3 py-1 text-xs" onClick={() => setViewMode('3D')}>
          3D
        </button>
        <button type="button" className="rounded-md p-1">
          <Scan className="size-4" />
        </button>
      </div>
      <div className="customizer-glass absolute bottom-24 left-1/2 z-20 hidden -translate-x-1/2 gap-2 rounded-xl px-3 py-2 md:flex">
        <button type="button" className="rounded-md p-1">
          <RotateCcw className="size-4" />
        </button>
        <button type="button" className="rounded-md p-1">
          <ZoomIn className="size-4" />
        </button>
        <button type="button" className="rounded-md p-1">
          <ZoomOut className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => setViewAngle(viewAngle === 'front' ? 'back' : 'front')}
        className="customizer-glass absolute bottom-24 right-6 z-20 hidden rounded-xl px-3 py-2 text-xs lg:block"
      >
        Vista {viewAngle === 'front' ? 'trasera' : 'frontal'}
      </button>
      {viewMode === '2D' ? (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-xs text-muted-foreground">
          Vista 2D disponible en la siguiente fase
        </div>
      ) : null}
    </>
  )
}

interface BottomActionBarProps {
  onAddToCart?: () => void
  isAddingToCart?: boolean
}

export function BottomActionBar({
  onAddToCart,
  isAddingToCart = false,
}: BottomActionBarProps) {
  const { size, product } = useCustomizerStore()
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="customizer-glass mx-auto flex max-w-3xl items-center justify-between rounded-t-2xl px-4 py-3">
        <div className="text-sm">
          <div className="text-xs text-muted-foreground">Producto</div>
          <div className="font-semibold">{product?.name ?? 'Producto'}</div>
        </div>
        <div className="text-sm">
          <div className="text-xs text-muted-foreground">Talla</div>
          <div className="font-semibold">{size}</div>
        </div>
        <div className="text-sm">
          <div className="text-xs text-muted-foreground">Precio</div>
          <div className="font-semibold text-primary">
            {product ? `$${(product.basePriceCents / 100).toLocaleString('es-MX')} MXN` : '—'}
          </div>
        </div>
        <Button onClick={onAddToCart} disabled={isAddingToCart}>
          {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}
