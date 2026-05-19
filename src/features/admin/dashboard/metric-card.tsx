'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

// TODO: Replace with TanStack Query for real-time metrics
interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  subtitle?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  icon,
  change,
  subtitle,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-sans text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 font-sans text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            
            {change && (
              <div className="mt-2 flex items-center gap-1">
                {change.type === 'increase' && (
                  <ArrowUpRight className="h-4 w-4 text-success" />
                )}
                {change.type === 'decrease' && (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
                {change.type === 'neutral' && (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    'font-sans text-sm font-medium',
                    change.type === 'increase' && 'text-success',
                    change.type === 'decrease' && 'text-destructive',
                    change.type === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {change.value > 0 ? '+' : ''}
                  {change.value}%
                </span>
                <span className="font-serif text-sm text-muted-foreground">
                  vs mes anterior
                </span>
              </div>
            )}
            
            {subtitle && (
              <p className="mt-1 font-serif text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <div className="text-primary">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
