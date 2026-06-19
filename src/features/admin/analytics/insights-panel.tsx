'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

// TODO: Replace with ML-generated insights from design_events
interface Insight {
  id: string
  text: string
  type: 'positive' | 'neutral' | 'actionable'
}

interface InsightsPanelProps {
  insights: Insight[]
  className?: string
}

export function InsightsPanel({ insights, className }: InsightsPanelProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-sans text-base font-semibold">
          <Lightbulb className="h-5 w-5 text-warning" />
          Recomendaciones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              'rounded-lg border p-3',
              insight.type === 'positive' && 'border-success/30 bg-success/5',
              insight.type === 'neutral' && 'border-border bg-secondary/50',
              insight.type === 'actionable' && 'border-warning/30 bg-warning/5',
            )}
          >
            <p className="font-serif text-sm text-foreground">{insight.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
