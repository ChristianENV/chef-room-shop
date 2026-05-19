'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export type CheckoutStep = 'informacion' | 'envio' | 'pago' | 'confirmacion'

const STEPS: { id: CheckoutStep; label: string }[] = [
  { id: 'informacion', label: 'Informacion' },
  { id: 'envio', label: 'Envio' },
  { id: 'pago', label: 'Pago' },
  { id: 'confirmacion', label: 'Confirmacion' },
]

interface CheckoutStepsProps {
  currentStep: CheckoutStep
  completedSteps: CheckoutStep[]
  className?: string
}

export function CheckoutSteps({ currentStep, completedSteps, className }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep)

  return (
    <nav aria-label="Progreso del checkout" className={cn('w-full', className)}>
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep
          const isPast = index < currentIndex

          return (
            <li key={step.id} className="flex flex-1 items-center">
              {/* Step Circle + Label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 font-sans text-sm font-semibold transition-colors',
                    isCompleted && 'border-success bg-success text-white',
                    isCurrent && !isCompleted && 'border-primary bg-primary text-white',
                    !isCurrent && !isCompleted && 'border-border bg-secondary text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 font-sans text-xs font-medium',
                    isCurrent && 'text-foreground',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1',
                    isPast || isCompleted ? 'bg-success' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
