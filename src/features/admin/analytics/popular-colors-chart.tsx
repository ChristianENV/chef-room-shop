'use client'

import { cn } from '@/lib/utils'

// TODO: Replace with TanStack Query for real color analytics
interface ColorData {
  name: string
  hex: string
  count: number
  percentage: number
}

interface PopularColorsChartProps {
  colors: ColorData[]
  className?: string
}

export function PopularColorsChart({ colors, className }: PopularColorsChartProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {colors.map((color) => (
        <div key={color.name} className="flex items-center gap-3">
          <div
            className="h-8 w-8 flex-shrink-0 rounded-md border border-border"
            style={{ backgroundColor: color.hex }}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-medium text-foreground">{color.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {color.count.toLocaleString()} ({color.percentage}%)
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${color.percentage}%`,
                  backgroundColor: color.hex,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
