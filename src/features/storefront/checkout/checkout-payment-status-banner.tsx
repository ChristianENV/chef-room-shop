'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react'

import type { PaymentStatusUi } from './lib/payment-status-ui'

type CheckoutPaymentStatusBannerProps = {
  statusUi: PaymentStatusUi
  isPolling?: boolean
  paymentReturnHint?: string | null
  className?: string
}

const TONE_BADGE_CLASS: Record<PaymentStatusUi['tone'], string> = {
  pending: 'border-warning/40 bg-warning/10 text-warning',
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
  neutral: 'border-border bg-secondary text-muted-foreground',
}

const TONE_ICON: Record<PaymentStatusUi['tone'], typeof CheckCircle2> = {
  pending: Clock,
  success: CheckCircle2,
  error: AlertCircle,
  neutral: AlertCircle,
}

const TONE_ICON_CLASS: Record<PaymentStatusUi['tone'], string> = {
  pending: 'text-warning',
  success: 'text-success',
  error: 'text-destructive',
  neutral: 'text-muted-foreground',
}

export function CheckoutPaymentStatusBanner({
  statusUi,
  isPolling = false,
  paymentReturnHint,
  className,
}: CheckoutPaymentStatusBannerProps) {
  const Icon = TONE_ICON[statusUi.tone]

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        statusUi.tone === 'success' && 'border-success/30 bg-success/5',
        statusUi.tone === 'pending' && 'border-warning/30 bg-warning/5',
        statusUi.tone === 'error' && 'border-destructive/30 bg-destructive/5',
        statusUi.tone === 'neutral' && 'border-border bg-secondary/50',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon className={cn('mt-0.5 h-6 w-6 shrink-0', TONE_ICON_CLASS[statusUi.tone])} />
          <div>
            <h2 className="font-sans text-lg font-semibold text-foreground">{statusUi.title}</h2>
            <p className="mt-1 font-serif text-sm text-muted-foreground">{statusUi.description}</p>
            {paymentReturnHint === 'failed' && statusUi.canPay && (
              <p className="mt-2 font-serif text-sm text-muted-foreground">
                Regresaste desde Conekta sin completar el pago. Puedes intentar de nuevo cuando
                quieras.
              </p>
            )}
            {isPolling && statusUi.shouldPoll && (
              <p className="mt-2 flex items-center gap-2 font-serif text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Actualizando estado del pago…
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={cn('font-sans', TONE_BADGE_CLASS[statusUi.tone])}>
          {statusUi.badgeLabel}
        </Badge>
      </div>
    </div>
  )
}
