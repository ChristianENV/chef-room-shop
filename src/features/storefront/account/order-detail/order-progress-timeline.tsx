import { Check, Circle, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { AccountOrder } from '../types'
import { buildOrderTimeline, type TimelineStepState } from './order-detail.utils'

type OrderProgressTimelineProps = {
  order: AccountOrder
}

function StepIcon({ state }: { state: TimelineStepState }) {
  if (state === 'completed') {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="h-4 w-4" aria-hidden />
      </span>
    )
  }
  if (state === 'failed') {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <X className="h-4 w-4" aria-hidden />
      </span>
    )
  }
  if (state === 'current') {
    return (
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10"
        aria-current="step"
      >
        <Circle className="h-3 w-3 fill-primary text-primary" aria-hidden />
      </span>
    )
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/50">
      <Circle className="h-3 w-3 text-muted-foreground/50" aria-hidden />
    </span>
  )
}

/**
 * Visual progress timeline for order lifecycle.
 */
export function OrderProgressTimeline({ order }: OrderProgressTimelineProps) {
  const steps = buildOrderTimeline(order)

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="order-timeline-title"
    >
      <h2 id="order-timeline-title" className="font-sans text-lg font-semibold text-foreground">
        Progreso del pedido
      </h2>

      <ol className="mt-6 space-y-0">
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'absolute left-4 top-8 h-[calc(100%-2rem)] w-px -translate-x-1/2',
                  step.state === 'completed' ? 'bg-primary/40' : 'bg-border',
                )}
                aria-hidden
              />
            )}
            <StepIcon state={step.state} />
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  'font-sans text-sm font-medium',
                  step.state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="mt-0.5 font-serif text-xs text-muted-foreground">{step.date}</p>
              )}
              {step.state === 'failed' && (
                <p className="mt-1 font-serif text-xs text-destructive">El pago no se completó</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
