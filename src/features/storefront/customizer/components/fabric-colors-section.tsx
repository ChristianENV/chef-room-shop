'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_FABRIC_COLORS,
  FABRIC_COLOR_GROUPS,
  groupFabricColors,
  type FabricColor,
} from '../constants/fabric-colors'
import type { NamedColor } from '../lib/customizer-defaults'
import { normalizeHex } from '../lib/resolve-customizer-variant'

function isLightColor(hex: string): boolean {
  const normalized = hex.replace('#', '')
  if (normalized.length < 6) return false
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.8
}

function FabricColorSwatch({
  color,
  selected,
  onSelect,
  compact = false,
}: {
  color: Pick<FabricColor, 'id' | 'name' | 'hex'>
  selected: boolean
  onSelect: () => void
  compact?: boolean
}) {
  const light = isLightColor(color.hex)

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${color.name} (${color.hex})`}
      aria-label={`${color.name}, ${color.hex}`}
      aria-pressed={selected}
      data-testid={`customizer-fabric-color-swatch-${color.id}`}
      className={cn(
        'group flex flex-col items-center gap-1.5 rounded-lg outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        compact ? 'gap-1' : 'gap-1.5',
      )}
    >
      <span
        className={cn(
          'relative flex items-center justify-center rounded-full ring-offset-2 ring-offset-background transition',
          compact ? 'size-9' : 'size-11',
          light ? 'border border-border/80' : 'border border-transparent',
          selected ? 'ring-2 ring-primary' : 'group-hover:ring-2 group-hover:ring-primary/30',
        )}
        style={{ backgroundColor: color.hex }}
      >
        {selected ? (
          <Check className={cn('size-4', light ? 'text-foreground' : 'text-white')} />
        ) : null}
      </span>
      {!compact ? (
        <span className="max-w-[4.5rem] text-center text-[11px] leading-tight text-muted-foreground">
          <span className="block truncate">{color.name}</span>
          <span className="block truncate font-mono text-[10px] opacity-70">{color.hex}</span>
        </span>
      ) : null}
    </button>
  )
}

type FabricColorsSectionProps = {
  colors?: readonly FabricColor[]
  catalogColors?: NamedColor[]
  detailColors?: NamedColor[]
  baseColor: string
  detailColor?: string
  onSelectBase: (hex: string) => void
  onSelectDetail?: (hex: string) => void
  showDetail?: boolean
  compact?: boolean
  className?: string
}

export function FabricColorsSection({
  colors = DEFAULT_FABRIC_COLORS,
  catalogColors,
  detailColors,
  baseColor,
  detailColor,
  onSelectBase,
  onSelectDetail,
  showDetail = false,
  compact = false,
  className,
}: FabricColorsSectionProps) {
  const palette: FabricColor[] =
    catalogColors && catalogColors.length > 0
      ? catalogColors.map((color) => ({
          id: color.id,
          name: color.name,
          hex: color.hex,
          group: 'Esenciales' as const,
        }))
      : [...colors]

  const grouped = groupFabricColors(palette)
  const usingCatalog = Boolean(catalogColors && catalogColors.length > 0)

  return (
    <div className={cn('space-y-5', className)} data-testid="customizer-fabric-colors-section">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Color de tela</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Tonos premium Chef Room para la prenda principal.
        </p>
      </div>

      {(usingCatalog ? [{ group: 'Esenciales' as const, items: palette }] : FABRIC_COLOR_GROUPS.map((group) => ({
        group,
        items: grouped[group],
      }))).map(({ group, items }) =>
        items.length === 0 ? null : (
          <section key={group} className="space-y-3">
            {!usingCatalog ? (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </p>
            ) : null}
            <div className={cn('flex flex-wrap gap-3', compact && 'gap-2.5')}>
              {items.map((color) => (
                <FabricColorSwatch
                  key={`base-${color.id}`}
                  color={color}
                  selected={normalizeHex(baseColor) === normalizeHex(color.hex)}
                  onSelect={() => onSelectBase(color.hex)}
                  compact={compact}
                />
              ))}
            </div>
          </section>
        ),
      )}

      {showDetail && onSelectDetail && detailColor !== undefined && detailColors ? (
        <section className="space-y-3 border-t border-border/40 pt-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Color de detalle</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">Vivos, cuello y puños.</p>
          </div>
          <div className={cn('flex flex-wrap gap-3', compact && 'gap-2.5')}>
            {detailColors.map((color) => (
              <FabricColorSwatch
                key={`detail-${color.id}`}
                color={color}
                selected={normalizeHex(detailColor) === normalizeHex(color.hex)}
                onSelect={() => onSelectDetail(color.hex)}
                compact={compact}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
