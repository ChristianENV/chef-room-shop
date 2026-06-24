'use client'

import { Loader2 } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { CHECKOUT_CONFIRMATION_VISUAL_MS } from './lib/checkout-polling.config'

type CheckoutPaymentConfirmingProps = {
  elapsedMs: number
  durationMs?: number
  active?: boolean
  className?: string
}

/**
 * Premium 30s visual progress while waiting for Conekta/webhook confirmation.
 */
export function CheckoutPaymentConfirming({
  elapsedMs,
  durationMs = CHECKOUT_CONFIRMATION_VISUAL_MS,
  active = true,
  className,
}: CheckoutPaymentConfirmingProps) {
  const progress = active ? Math.min(100, Math.round((elapsedMs / durationMs) * 100)) : 100
  const secondsRemaining = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000))

  return (
    <div
      className={cn('rounded-lg border border-primary/20 bg-primary/5 p-5', className)}
      role="status"
      aria-live="polite"
      aria-busy={active}
    >
      <div className="flex items-start gap-3">
        <Loader2
          className={cn('mt-0.5 h-6 w-6 shrink-0 text-primary', active && 'animate-spin')}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="font-sans text-base font-semibold text-foreground">Confirmando pago</p>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Estamos validando la respuesta de Conekta.
            </p>
            <p className="mt-1 font-serif text-xs text-muted-foreground">
              Si tu pago fue aprobado, actualizaremos esta pantalla automáticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between font-serif text-xs text-muted-foreground">
              <span>Validando con Conekta…</span>
              {active && secondsRemaining > 0 ? (
                <span>~{secondsRemaining}s</span>
              ) : (
                <span>Completado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
