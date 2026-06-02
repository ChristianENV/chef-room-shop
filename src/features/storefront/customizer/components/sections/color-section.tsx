'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../../store/customizer.store'
import { FALLBACK_COLORS } from '../../lib/customizer-defaults'
import type { NamedColor } from '../../lib/customizer-defaults'

/** True for very light swatches that need a dark check/border for contrast. */
function isLightColor(hex: string): boolean {
  const normalized = hex.replace('#', '')
  if (normalized.length < 6) return false
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.8
}

function ColorSwatch({
  color,
  selected,
  onSelect,
}: {
  color: NamedColor
  selected: boolean
  onSelect: () => void
}) {
  const light = isLightColor(color.hex)
  return (
    <button
      type="button"
      onClick={onSelect}
      title={color.name}
      aria-label={color.name}
      aria-pressed={selected}
      data-testid="customizer-color-option"
      className="flex flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          'relative flex size-11 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition',
          light ? 'border border-border/70' : 'border border-transparent',
          selected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-primary/30',
        )}
        style={{ backgroundColor: color.hex }}
      >
        {selected ? (
          <Check className={cn('size-4', light ? 'text-foreground' : 'text-white')} />
        ) : null}
      </span>
      <span className="max-w-[3.5rem] truncate text-[11px] text-muted-foreground">
        {color.name}
      </span>
    </button>
  )
}

export function ColorSection() {
  const { product, baseColor, detailColor, setBaseColor, setDetailColor } = useCustomizerStore()

  const fromBff = (product?.colors ?? []).map((color) => ({
    id: color.id,
    name: color.name,
    hex: color.hex,
  }))
  const colors: NamedColor[] = fromBff.length > 0 ? fromBff : FALLBACK_COLORS
  const usingFallback = fromBff.length === 0

  return (
    <div className="space-y-6 p-4">
      <section data-testid="customizer-base-colors" className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Color principal</h3>
          <p className="text-xs text-muted-foreground">Color base de la prenda.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <ColorSwatch
              key={`base-${color.id}`}
              color={color}
              selected={baseColor.toLowerCase() === color.hex.toLowerCase()}
              onSelect={() => setBaseColor(color.hex)}
            />
          ))}
        </div>
      </section>

      <section data-testid="customizer-detail-colors" className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Color de detalle</h3>
          <p className="text-xs text-muted-foreground">Vivos, cuello y puños.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <ColorSwatch
              key={`detail-${color.id}`}
              color={color}
              selected={detailColor.toLowerCase() === color.hex.toLowerCase()}
              onSelect={() => setDetailColor(color.hex)}
            />
          ))}
        </div>
      </section>

      {usingFallback ? (
        <p className="text-[11px] text-muted-foreground/70">
          Mostrando colores sugeridos. Esta prenda aún no tiene variantes de color en catálogo.
        </p>
      ) : null}
    </div>
  )
}
