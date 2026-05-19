'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// TODO: Replace with actual chart library (Recharts via shadcn charts)
interface AdminChartCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function AdminChartCard({
  title,
  description,
  action,
  children,
  className,
}: AdminChartCardProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="font-sans text-base font-semibold">
            {title}
          </CardTitle>
          {description && (
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// Chart Placeholder Component
interface ChartPlaceholderProps {
  height?: number
  type: 'line' | 'bar' | 'pie' | 'donut'
  label?: string
}

export function ChartPlaceholder({ height = 200, type, label }: ChartPlaceholderProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30"
      style={{ height }}
    >
      <div className="mb-2 rounded-full bg-primary/10 p-3">
        {type === 'line' && (
          <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
          </svg>
        )}
        {type === 'bar' && (
          <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="12" width="4" height="9" />
            <rect x="10" y="6" width="4" height="15" />
            <rect x="17" y="3" width="4" height="18" />
          </svg>
        )}
        {type === 'pie' && (
          <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v10l7.5 4.3" />
          </svg>
        )}
        {type === 'donut' && (
          <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        )}
      </div>
      <p className="font-sans text-sm font-medium text-muted-foreground">
        {label || `Grafico ${type}`}
      </p>
      <p className="mt-1 font-serif text-xs text-muted-foreground">
        Conectar con datos reales
      </p>
    </div>
  )
}
