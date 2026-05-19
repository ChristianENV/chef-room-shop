'use client'

import { cn } from '@/lib/utils'

// TODO: Replace with real data from design_events
interface AreaData {
  name: string
  count: number
  percentage: number
}

interface GarmentAreasChartProps {
  areas: AreaData[]
  className?: string
}

export function GarmentAreasChart({ areas, className }: GarmentAreasChartProps) {
  const maxCount = Math.max(...areas.map(a => a.count))

  return (
    <div className={cn('space-y-3', className)}>
      {areas.map((area) => (
        <div key={area.name} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-sans text-sm font-medium text-foreground">
              {area.name}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {area.count.toLocaleString()} ({area.percentage}%)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(area.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Customization types distribution
interface TypeData {
  name: string
  icon: string
  count: number
  percentage: number
}

interface CustomizationTypesChartProps {
  types: TypeData[]
  className?: string
}

export function CustomizationTypesChart({ types, className }: CustomizationTypesChartProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      {types.map((type) => (
        <div
          key={type.name}
          className="rounded-lg border border-border bg-secondary/30 p-4 text-center"
        >
          <p className="font-sans text-2xl font-bold text-foreground">
            {type.percentage}%
          </p>
          <p className="mt-1 font-sans text-sm font-medium text-muted-foreground">
            {type.name}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {type.count.toLocaleString()} usos
          </p>
        </div>
      ))}
    </div>
  )
}
