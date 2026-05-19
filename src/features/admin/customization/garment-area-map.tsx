'use client'

import { cn } from '@/lib/utils'
import type { GarmentAreaId, ProductCategory } from '@/lib/types'

interface GarmentAreaMapProps {
  productType: ProductCategory | 'all'
  selectedArea: GarmentAreaId | null
  onAreaSelect: (area: GarmentAreaId) => void
  areaStates: Record<GarmentAreaId, { enabled: boolean; hasRules: boolean }>
}

interface AreaConfig {
  id: GarmentAreaId
  name: string
  x: number
  y: number
  width: number
  height: number
}

const filipinaAreas: AreaConfig[] = [
  { id: 'pecho', name: 'Pecho', x: 80, y: 100, width: 120, height: 80 },
  { id: 'espalda', name: 'Espalda', x: 330, y: 80, width: 140, height: 120 },
  { id: 'manga-izquierda', name: 'Manga Izq.', x: 20, y: 80, width: 50, height: 60 },
  { id: 'manga-derecha', name: 'Manga Der.', x: 210, y: 80, width: 50, height: 60 },
  { id: 'bolsillo', name: 'Bolsillo', x: 90, y: 180, width: 40, height: 40 },
  { id: 'cuello', name: 'Cuello', x: 110, y: 30, width: 60, height: 30 },
]

const mandilAreas: AreaConfig[] = [
  { id: 'pecho', name: 'Pecho', x: 80, y: 80, width: 120, height: 100 },
  { id: 'bolsillo', name: 'Bolsillo', x: 90, y: 200, width: 50, height: 50 },
]

const pantalonAreas: AreaConfig[] = [
  { id: 'bolsillo', name: 'Bolsillo', x: 100, y: 80, width: 60, height: 50 },
]

export function GarmentAreaMap({
  productType,
  selectedArea,
  onAreaSelect,
  areaStates,
}: GarmentAreaMapProps) {
  const areas = productType === 'filipinas' 
    ? filipinaAreas 
    : productType === 'mandiles'
    ? mandilAreas
    : productType === 'pantalones'
    ? pantalonAreas
    : filipinaAreas // default

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 font-sans text-sm font-semibold text-foreground">
        Mapa de Zonas Personalizables
      </h3>
      
      <div className="flex gap-6">
        {/* Garment SVG - Front View */}
        <div className="relative flex-1">
          <div className="mb-2 text-center font-sans text-xs text-muted-foreground">Vista Frontal</div>
          <svg
            viewBox="0 0 280 300"
            className="mx-auto h-64 w-auto"
            aria-label="Mapa de prenda vista frontal"
          >
            {/* Garment silhouette */}
            <path
              d={productType === 'mandiles' 
                ? 'M60,40 L220,40 L220,280 L60,280 Z M120,40 L160,40 L160,10 Q140,0 120,10 Z'
                : productType === 'pantalones'
                ? 'M60,20 L220,20 L220,50 L180,50 L180,280 L140,280 L140,50 L140,280 L100,280 L100,50 L60,50 Z'
                : 'M40,60 L80,20 L120,40 L140,10 L160,40 L200,20 L240,60 L220,80 L220,280 L60,280 L60,80 Z'
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            
            {/* Clickable areas */}
            {areas.map((area) => {
              const state = areaStates[area.id] || { enabled: false, hasRules: false }
              const isSelected = selectedArea === area.id
              
              return (
                <g key={area.id}>
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
                        : state.enabled
                        ? 'fill-success/20 stroke-success hover:fill-success/30'
                        : 'fill-muted/30 stroke-muted-foreground/50 hover:fill-muted/50'
                    )}
                    onClick={() => onAreaSelect(area.id)}
                  />
                  <text
                    x={area.x + area.width / 2}
                    y={area.y + area.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={cn(
                      'pointer-events-none font-sans text-[10px] font-medium',
                      isSelected ? 'fill-primary' : state.enabled ? 'fill-success' : 'fill-muted-foreground'
                    )}
                  >
                    {area.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Garment SVG - Back View (for filipinas) */}
        {productType === 'filipinas' && (
          <div className="relative flex-1">
            <div className="mb-2 text-center font-sans text-xs text-muted-foreground">Vista Trasera</div>
            <svg
              viewBox="280 0 220 300"
              className="mx-auto h-64 w-auto"
              aria-label="Mapa de prenda vista trasera"
            >
              {/* Back silhouette */}
              <path
                d="M300,60 L340,20 L380,40 L400,30 L420,40 L460,20 L500,60 L480,80 L480,280 L320,280 L320,80 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-border"
              />
              
              {/* Espalda area */}
              {areas.filter(a => a.id === 'espalda').map((area) => {
                const state = areaStates[area.id] || { enabled: false, hasRules: false }
                const isSelected = selectedArea === area.id
                
                return (
                  <g key={area.id}>
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
                          : state.enabled
                          ? 'fill-success/20 stroke-success hover:fill-success/30'
                          : 'fill-muted/30 stroke-muted-foreground/50 hover:fill-muted/50'
                      )}
                      onClick={() => onAreaSelect(area.id)}
                    />
                    <text
                      x={area.x + area.width / 2}
                      y={area.y + area.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={cn(
                        'pointer-events-none font-sans text-[10px] font-medium',
                        isSelected ? 'fill-primary' : state.enabled ? 'fill-success' : 'fill-muted-foreground'
                      )}
                    >
                      {area.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-success/30 ring-1 ring-success" />
          <span className="text-muted-foreground">Activa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-muted/30 ring-1 ring-muted-foreground/50" />
          <span className="text-muted-foreground">Inactiva</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-primary/30 ring-2 ring-primary" />
          <span className="text-muted-foreground">Seleccionada</span>
        </div>
      </div>
    </div>
  )
}
