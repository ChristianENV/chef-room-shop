'use client'

import { cn } from '@/lib/utils'

// TODO: Replace with TanStack Query for real design_events analytics
interface FunnelStep {
  label: string
  value: number
  color: string
}

interface FunnelChartProps {
  steps: FunnelStep[]
  className?: string
}

export function FunnelChart({ steps, className }: FunnelChartProps) {
  const maxValue = Math.max(...steps.map((s) => s.value))

  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => {
        const percentage = (step.value / maxValue) * 100
        const conversionFromPrev =
          index > 0 ? ((step.value / steps[index - 1].value) * 100).toFixed(1) : null

        return (
          <div key={step.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-medium text-foreground">{step.label}</span>
                {conversionFromPrev && (
                  <span className="font-mono text-xs text-muted-foreground">
                    ({conversionFromPrev}%)
                  </span>
                )}
              </div>
              <span className="font-sans text-sm font-semibold text-foreground">
                {step.value.toLocaleString()}
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-md bg-secondary">
              <div
                className="h-full rounded-md transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: step.color,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
