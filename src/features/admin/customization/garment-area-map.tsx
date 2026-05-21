'use client'

import { cn } from '@/lib/utils'
import type { GarmentMapType } from './types/admin-customization-ui.types'

type AreaMapConfig = {
  slug: string
  name: string
  x: number
  y: number
  width: number
  height: number
  backView?: boolean
}

interface GarmentAreaMapProps {
  garmentType: GarmentMapType
  selectedAreaSlug: string | null
  onAreaSelect: (areaSlug: string) => void
  areaStates: Record<string, { enabled: boolean; hasRules: boolean }>
}

const filipinaAreas: AreaMapConfig[] = [
  { slug: 'chest', name: 'Pecho', x: 80, y: 100, width: 120, height: 80 },
  { slug: 'left-sleeve', name: 'Manga izq.', x: 20, y: 80, width: 50, height: 60 },
  { slug: 'right-sleeve', name: 'Manga der.', x: 210, y: 80, width: 50, height: 60 },
  { slug: 'pocket', name: 'Bolsillo', x: 90, y: 180, width: 40, height: 40 },
  { slug: 'back', name: 'Espalda', x: 330, y: 80, width: 140, height: 120, backView: true },
]

const mandilAreas: AreaMapConfig[] = [
  { slug: 'chest', name: 'Pecho', x: 80, y: 80, width: 120, height: 100 },
  { slug: 'pocket', name: 'Bolsillo', x: 90, y: 200, width: 50, height: 50 },
]

const pantalonAreas: AreaMapConfig[] = [
  { slug: 'pocket', name: 'Bolsillo', x: 100, y: 80, width: 60, height: 50 },
]

function getAreasForType(type: GarmentMapType): AreaMapConfig[] {
  if (type === 'mandiles') return mandilAreas
  if (type === 'pantalones') return pantalonAreas
  return filipinaAreas
}

function AreaRect({
  area,
  selectedAreaSlug,
  areaStates,
  onAreaSelect,
}: {
  area: AreaMapConfig
  selectedAreaSlug: string | null
  areaStates: GarmentAreaMapProps['areaStates']
  onAreaSelect: (slug: string) => void
}) {
  const state = areaStates[area.slug] ?? { enabled: false, hasRules: false }
  const isSelected = selectedAreaSlug === area.slug

  return (
    <g>
      <rect
        x={area.x}
        y={area.y}
        width={area.width}
        height={area.height}
        rx={4}
        className={cn(
          'cursor-pointer transition-all',
          isSelected
            ? 'fill-primary/30 stroke-primary stroke-2'
            : state.hasRules && state.enabled
              ? 'fill-success/20 stroke-success hover:fill-success/30'
              : state.hasRules
                ? 'fill-muted/40 stroke-muted-foreground hover:fill-muted/50'
                : 'fill-muted/20 stroke-muted-foreground/40 hover:fill-muted/30',
        )}
        onClick={() => onAreaSelect(area.slug)}
      />
      <text
        x={area.x + area.width / 2}
        y={area.y + area.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className={cn(
          'pointer-events-none font-sans text-[10px] font-medium',
          isSelected
            ? 'fill-primary'
            : state.hasRules && state.enabled
              ? 'fill-success'
              : 'fill-muted-foreground',
        )}
      >
        {area.name}
      </text>
    </g>
  )
}

export function GarmentAreaMap({
  garmentType,
  selectedAreaSlug,
  onAreaSelect,
  areaStates,
}: GarmentAreaMapProps) {
  const areas = getAreasForType(garmentType)
  const frontAreas = areas.filter((a) => !a.backView)
  const backAreas = areas.filter((a) => a.backView)

  const silhouettePath =
    garmentType === 'mandiles'
      ? 'M60,40 L220,40 L220,280 L60,280 Z M120,40 L160,40 L160,10 Q140,0 120,10 Z'
      : garmentType === 'pantalones'
        ? 'M60,20 L220,20 L220,50 L180,50 L180,280 L140,280 L140,50 L100,50 L100,280 L60,50 Z'
        : 'M40,60 L80,20 L120,40 L140,10 L160,40 L200,20 L240,60 L220,80 L220,280 L60,280 L60,80 Z'

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 font-sans text-sm font-semibold text-foreground">
        Mapa de zonas
      </h3>
      <p className="mb-4 font-serif text-xs text-muted-foreground">
        Vista administrativa — no es el customizador de tienda.
      </p>

      <div className={cn('flex gap-6', backAreas.length === 0 && 'justify-center')}>
        <div className="relative flex-1 max-w-xs">
          <div className="mb-2 text-center font-sans text-xs text-muted-foreground">
            Vista frontal
          </div>
          <svg viewBox="0 0 280 300" className="mx-auto h-56 w-full" aria-label="Zonas frontal">
            <path
              d={silhouettePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            {frontAreas.map((area) => (
              <AreaRect
                key={area.slug}
                area={area}
                selectedAreaSlug={selectedAreaSlug}
                areaStates={areaStates}
                onAreaSelect={onAreaSelect}
              />
            ))}
          </svg>
        </div>

        {backAreas.length > 0 ? (
          <div className="relative flex-1 max-w-xs">
            <div className="mb-2 text-center font-sans text-xs text-muted-foreground">
              Vista trasera
            </div>
            <svg viewBox="280 0 220 300" className="mx-auto h-56 w-full" aria-label="Zonas trasera">
              <path
                d="M300,60 L340,20 L380,40 L400,30 L420,40 L460,20 L500,60 L480,80 L480,280 L320,280 L320,80 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-border"
              />
              {backAreas.map((area) => (
                <AreaRect
                  key={area.slug}
                  area={area}
                  selectedAreaSlug={selectedAreaSlug}
                  areaStates={areaStates}
                  onAreaSelect={onAreaSelect}
                />
              ))}
            </svg>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-success/30 ring-1 ring-success" />
          <span className="text-muted-foreground">Con reglas activas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-muted/40 ring-1 ring-muted-foreground/50" />
          <span className="text-muted-foreground">Con reglas inactivas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary/30 ring-2 ring-primary" />
          <span className="text-muted-foreground">Seleccionada</span>
        </div>
      </div>
    </div>
  )
}
