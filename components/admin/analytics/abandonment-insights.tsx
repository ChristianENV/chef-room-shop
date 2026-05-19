'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Clock, DollarSign, ImageOff } from 'lucide-react'

// TODO: Replace with TanStack Query for real abandonment analytics
interface AbandonmentInsight {
  id: string
  title: string
  value: string
  description: string
  icon: 'step' | 'time' | 'image' | 'price'
  severity: 'info' | 'warning' | 'critical'
}

const iconMap = {
  step: AlertCircle,
  time: Clock,
  image: ImageOff,
  price: DollarSign,
}

const severityColors = {
  info: 'bg-accent/10 text-accent',
  warning: 'bg-warning/10 text-warning',
  critical: 'bg-destructive/10 text-destructive',
}

interface AbandonmentInsightsProps {
  insights: AbandonmentInsight[]
  className?: string
}

export function AbandonmentInsights({ insights, className }: AbandonmentInsightsProps) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)}>
      {insights.map((insight) => {
        const Icon = iconMap[insight.icon]

        return (
          <Card key={insight.id} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn('rounded-lg p-2', severityColors[insight.severity])}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium text-muted-foreground">
                    {insight.title}
                  </p>
                  <p className="mt-1 font-sans text-2xl font-bold text-foreground">
                    {insight.value}
                  </p>
                  <p className="mt-1 font-serif text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
