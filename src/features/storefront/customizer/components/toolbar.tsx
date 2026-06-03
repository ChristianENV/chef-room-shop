'use client'

import { Minus, Plus, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../store/customizer.store'
import { formatPriceMxn } from '../lib/customizer-utils'

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
  saveStatusLabel,
}: TopToolbarProps) {
  const { undo, redo, past, future, isDirty, saveStatus } = useCustomizerStore()

  const statusLabel =
    saveStatusLabel ??
    (saveStatus === 'saving'
      ? 'Guardando…'
      : saveStatus === 'error'
      ? 'Error al guardar'
      : isDirty
      ? 'Cambios sin guardar'
      : saveStatus === 'saved'
      ? 'Guardado'
      : 'Listo para diseñar')

  const statusTone =
    saveStatus === 'error' || saveStatusLabel?.includes('Error')
      ? 'text-destructive'
      : saveStatusLabel?.includes('sin vista') || saveStatusLabel?.includes('no pudimos')
      ? 'text-amber-600'
      : isDirty && !isSaving
      ? 'text-amber-600'
      : saveStatus === 'saved' || saveStatusLabel?.includes('guardado')
      ? 'text-emerald-600'
      : 'text-muted-foreground'

  return (
    <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 px-4 py-3">
      <div className="customizer-glass flex items-center gap-1 rounded-xl p-1">
        <button
          type="button"
          title="Deshacer"
          onClick={undo}
          disabled={past.length === 0}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
        >
          <Undo2 className="size-4" />
        </button>
        <button
          type="button"
          title="Rehacer"
          onClick={redo}
          disabled={future.length === 0}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
        >
          <Redo2 className="size-4" />
        </button>
      </div>

      <div className={cn('customizer-glass rounded-xl px-3 py-2 text-xs font-medium', statusTone)}>
        {statusLabel}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onSaveDesign}
          disabled={isSaving}
          data-testid="customizer-save-button"
        >
          {isSaving ? 'Guardando…' : 'Guardar diseño'}
        </Button>
        <Button
          size="sm"
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="hidden sm:inline-flex"
          data-testid="customizer-add-to-cart-button"
        >
          {isAddingToCart ? 'Agregando…' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}

export function ViewportControls() {
  const { viewMode, setViewMode, viewAngle, setViewAngle } = useCustomizerStore()

  return (
    <>
      <div className="customizer-glass absolute left-1/2 top-20 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setViewMode('2D')}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition',
            viewMode === '2D' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          2D
        </button>
        <button
          type="button"
          onClick={() => setViewMode('3D')}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition',
            viewMode === '3D' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          3D
        </button>
      </div>

      <div className="customizer-glass absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setViewAngle('front')}
          data-testid="customizer-front-back-toggle"
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition',
            viewAngle === 'front' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          Frente
        </button>
        <button
          type="button"
          onClick={() => setViewAngle('back')}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition',
            viewAngle === 'back' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          Espalda
        </button>
        <button
          type="button"
          title="Reiniciar vista"
          onClick={() => setViewAngle('front')}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      {viewMode === '3D' ? (
        <div className="absolute bottom-[5.5rem] left-1/2 z-10 hidden -translate-x-1/2 text-[11px] text-muted-foreground md:block">
          Arrastra para rotar · usa scroll para acercar
        </div>
      ) : (
        <div className="absolute bottom-[5.5rem] left-1/2 z-10 -translate-x-1/2 text-[11px] text-muted-foreground">
          Vista 2D detallada disponible próximamente
        </div>
      )}
    </>
  )
}

interface BottomActionBarProps {
  onAddToCart?: () => void
  isAddingToCart?: boolean
}

export function BottomActionBar({ onAddToCart, isAddingToCart = false }: BottomActionBarProps) {
  const { size, product, quantity, setQuantity } = useCustomizerStore()
  const unitPriceCents = product?.basePriceCents ?? 0

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="customizer-glass mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-t-2xl px-4 py-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Producto</div>
          <div className="truncate text-sm font-semibold text-foreground">
            {product?.name ?? 'Producto'}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Talla</div>
          <div className="text-sm font-semibold text-foreground">{size}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Precio</div>
          <div className="text-sm font-semibold text-primary">
            {product ? formatPriceMxn(unitPriceCents) : '—'}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Cantidad</div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Disminuir"
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= 1}
              className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              title="Aumentar"
              onClick={() => setQuantity(quantity + 1)}
              className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
        <Button onClick={onAddToCart} disabled={isAddingToCart}>
          {isAddingToCart ? 'Agregando…' : 'Agregar al carrito'}
        </Button>
      </div>
    </div>
  )
}
