'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'

import { CheckoutPaymentConfirming } from './checkout-payment-confirming'
import type { PaymentConfirmationUxState } from './lib/payment-confirmation-state'
import { getPaymentConfirmationCopy } from './lib/payment-confirmation-state'

type CheckoutPaymentStatusBannerProps = {
  confirmationState: PaymentConfirmationUxState
  elapsedMs?: number
  isPolling?: boolean
  paymentReturnHint?: string | null
  className?: string
}

const TONE_BADGE_CLASS: Record<'pending' | 'success' | 'error' | 'neutral', string> = {
  pending: 'border-warning/40 bg-warning/10 text-warning',
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
  neutral: 'border-border bg-secondary text-muted-foreground',
}

const TONE_ICON: Record<'pending' | 'success' | 'error' | 'neutral', typeof CheckCircle2> = {
  pending: Clock,
  success: CheckCircle2,
  error: AlertCircle,
  neutral: AlertCircle,
}

const TONE_ICON_CLASS: Record<'pending' | 'success' | 'error' | 'neutral', string> = {
  pending: 'text-warning',
  success: 'text-success',
  error: 'text-destructive',
  neutral: 'text-muted-foreground',
}

export function CheckoutPaymentStatusBanner({
  confirmationState,
  elapsedMs = 0,
  isPolling = false,
  paymentReturnHint,
  className,
}: CheckoutPaymentStatusBannerProps) {
  const copy = getPaymentConfirmationCopy(confirmationState)
  const Icon = TONE_ICON[copy.tone]

  if (confirmationState === 'confirming' || confirmationState === 'loading') {
    return (
      <div className={cn('space-y-4', className)}>
        <CheckoutPaymentConfirming
          elapsedMs={elapsedMs}
          active={confirmationState === 'confirming' || confirmationState === 'loading'}
        />
        <p className="font-serif text-xs text-muted-foreground">
          Podrás continuar cuando Conekta termine de confirmar el pago.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        copy.tone === 'success' && 'border-success/30 bg-success/5',
        copy.tone === 'pending' && 'border-warning/30 bg-warning/5',
        copy.tone === 'error' && 'border-destructive/30 bg-destructive/5',
        copy.tone === 'neutral' && 'border-border bg-secondary/50',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon className={cn('mt-0.5 h-6 w-6 shrink-0', TONE_ICON_CLASS[copy.tone])} />
          <div>
            <h2 className="font-sans text-lg font-semibold text-foreground">{copy.title}</h2>
            <p className="mt-1 font-serif text-sm text-muted-foreground">{copy.description}</p>
            {copy.note && (
              <p className="mt-2 font-serif text-sm text-muted-foreground">{copy.note}</p>
            )}
            {paymentReturnHint === 'failed' && confirmationState === 'failed' && (
              <p className="mt-2 font-serif text-sm text-muted-foreground">
                Regresaste desde Conekta sin completar el pago. Puedes intentar de nuevo cuando
                quieras.
              </p>
            )}
            {isPolling && confirmationState === 'pendingAfterTimeout' && (
              <p className="mt-2 flex items-center gap-2 font-serif text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Seguimos consultando el estado del pago…
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={cn('font-sans', TONE_BADGE_CLASS[copy.tone])}>
          {copy.badgeLabel}
        </Badge>
      </div>
    </div>
  )
}
