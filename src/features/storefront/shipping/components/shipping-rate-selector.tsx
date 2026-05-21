'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Truck } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { normalizeCountryCode } from '@/src/features/storefront/checkout/lib/checkout-form.validation'
import type { SelectedShippingRateSummary } from '@/src/features/storefront/checkout/types/checkout-shipping.types'
import { useCreateShippingQuoteMutation } from '../api/use-create-shipping-quote-mutation'
import { useRefreshShippingQuoteMutation } from '../api/use-refresh-shipping-quote-mutation'
import { useSelectShippingRateMutation } from '../api/use-select-shipping-rate-mutation'
import {
  getShippingQuoteErrorMessage,
  isSkydropxUnavailableError,
} from '../lib/shipping-quote-errors'
import type { ShippingQuotePayload, ShippingRate } from '../types'
import { ShippingQuoteEmpty } from './shipping-quote-empty'
import { ShippingQuoteError } from './shipping-quote-error'
import { ShippingQuoteLoading } from './shipping-quote-loading'
import { ShippingRateCard } from './shipping-rate-card'

const MX_POSTAL_REGEX = /^\d{5}$/
const POLL_INTERVAL_MS = 2500
const MAX_POLL_ATTEMPTS = 12

export type ShippingRateSelectorProps = {
  destinationPostalCode: string
  destinationCity?: string
  destinationState?: string
  destinationCountry?: string
  selectedRateId?: string | null
  onRateSelected: (selection: SelectedShippingRateSummary | null) => void
  onQuoteIdChange?: (quoteId: string | null) => void
  onUnavailableChange?: (unavailable: boolean) => void
  disabled?: boolean
  hasCustomization?: boolean
  className?: string
}

function toSelection(
  rate: ShippingRate,
  quoteId: string,
): SelectedShippingRateSummary {
  return {
    rateId: rate.id,
    quoteId,
    carrier: rate.carrier,
    service: rate.service,
    amountCents: rate.amountCents,
    estimatedDays: rate.estimatedDays,
  }
}

export function ShippingRateSelector({
  destinationPostalCode,
  destinationCity,
  destinationState,
  destinationCountry = 'Mexico',
  selectedRateId,
  onRateSelected,
  onQuoteIdChange,
  onUnavailableChange,
  disabled,
  hasCustomization,
  className,
}: ShippingRateSelectorProps) {
  const [payload, setPayload] = useState<ShippingQuotePayload | null>(null)
  const [userError, setUserError] = useState<string | null>(null)
  const [skydropxUnavailable, setSkydropxUnavailable] = useState(false)
  const [pollAttempts, setPollAttempts] = useState(0)

  const createQuote = useCreateShippingQuoteMutation()
  const refreshQuote = useRefreshShippingQuoteMutation()
  const selectRate = useSelectShippingRateMutation()

  const postalCode = destinationPostalCode.trim()
  const canQuote =
    MX_POSTAL_REGEX.test(postalCode) &&
    Boolean(destinationCity?.trim()) &&
    Boolean(destinationState?.trim()) &&
    !disabled

  const isBusy =
    createQuote.isPending || refreshQuote.isPending || selectRate.isPending

  const rates = useMemo(() => payload?.quote.rates ?? [], [payload?.quote.rates])
  const recommendedId = payload?.recommendedRate?.id ?? null

  const cheapestAmount = useMemo(() => {
    if (rates.length === 0) return null
    return Math.min(...rates.map((r) => r.amountCents))
  }, [rates])

  const applyPayload = useCallback(
    (next: ShippingQuotePayload) => {
      setPayload(next)
      onQuoteIdChange?.(next.quote.id)

      const selected = next.quote.rates.find((r) => r.selectedAt)
      if (selected) {
        onRateSelected(toSelection(selected, next.quote.id))
      }
    },
    [onQuoteIdChange, onRateSelected],
  )

  const handleQuote = useCallback(async () => {
    if (!canQuote) return
    setUserError(null)
    setPollAttempts(0)
    onUnavailableChange?.(false)
    setSkydropxUnavailable(false)

    try {
      const result = await createQuote.mutateAsync({
        destination: {
          postalCode,
          city: destinationCity?.trim(),
          state: destinationState?.trim(),
          country: normalizeCountryCode(destinationCountry),
        },
      })
      applyPayload(result)
    } catch (error) {
      if (isSkydropxUnavailableError(error)) {
        setSkydropxUnavailable(true)
        onUnavailableChange?.(true)
        setUserError(getShippingQuoteErrorMessage(error))
        setPayload(null)
        onQuoteIdChange?.(null)
        onRateSelected(null)
        return
      }
      setUserError(getShippingQuoteErrorMessage(error))
    }
  }, [
    applyPayload,
    canQuote,
    createQuote,
    destinationCity,
    destinationCountry,
    destinationState,
    onQuoteIdChange,
    onRateSelected,
    onUnavailableChange,
    postalCode,
  ])

  const handleSelectRate = useCallback(
    async (rate: ShippingRate) => {
      if (!payload || disabled) return
      setUserError(null)
      try {
        const result = await selectRate.mutateAsync(rate.id)
        applyPayload(result)
        const selected =
          result.quote.rates.find((r) => r.id === rate.id) ?? rate
        onRateSelected(toSelection(selected, result.quote.id))
      } catch (error) {
        setUserError(getShippingQuoteErrorMessage(error))
      }
    },
    [applyPayload, disabled, onRateSelected, payload, selectRate],
  )

  useEffect(() => {
    if (!payload?.quote.id || payload.quote.isCompleted) return
    if (pollAttempts >= MAX_POLL_ATTEMPTS) return

    const timer = window.setInterval(() => {
      void refreshQuote
        .mutateAsync(payload.quote.id)
        .then((result) => {
          applyPayload(result)
          setPollAttempts((n) => n + 1)
        })
        .catch(() => {
          setPollAttempts((n) => n + 1)
        })
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [
    applyPayload,
    payload?.quote.id,
    payload?.quote.isCompleted,
    pollAttempts,
    refreshQuote,
  ])

  const showPollingMessage =
    Boolean(payload) && !payload?.quote.isCompleted && rates.length === 0

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Opciones de envío
        </h2>
      </div>

      {hasCustomization && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
          <p className="font-serif text-sm text-warning">
            Tu pedido incluye productos personalizados. El tiempo de producción es
            adicional al tiempo de envío mostrado por la paquetería.
          </p>
        </div>
      )}

      <p className="font-serif text-sm text-muted-foreground">
        Cotizamos el envío con el contenido actual de tu carrito. No necesitas indicar
        peso ni medidas del paquete.
      </p>

      {!canQuote && (
        <Alert>
          <AlertDescription className="font-serif text-sm">
            Completa código postal (5 dígitos), ciudad y estado para cotizar envío.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full font-sans sm:w-auto"
        disabled={!canQuote || isBusy || disabled}
        onClick={() => void handleQuote()}
      >
        {createQuote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cotizar envío
      </Button>

      {userError && (
        <ShippingQuoteError
          message={userError}
          onRetry={
            canQuote && !skydropxUnavailable ? () => void handleQuote() : undefined
          }
        />
      )}

      {isBusy && !payload && <ShippingQuoteLoading />}

      {showPollingMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="font-serif text-sm text-muted-foreground">
            Estamos buscando mejores tarifas…
          </p>
        </div>
      )}

      {payload && rates.length === 0 && payload.quote.isCompleted && !isBusy && (
        <ShippingQuoteEmpty />
      )}

      {rates.length > 0 && (
        <div className="space-y-3">
          {rates.map((rate) => (
            <ShippingRateCard
              key={rate.id}
              rate={rate}
              selected={selectedRateId === rate.id}
              isRecommended={rate.id === recommendedId}
              isCheapest={
                cheapestAmount !== null && rate.amountCents === cheapestAmount
              }
              disabled={disabled || isBusy}
              onSelect={() => void handleSelectRate(rate)}
            />
          ))}
        </div>
      )}

      <div className="rounded-lg bg-secondary/50 p-4">
        <h3 className="font-sans text-sm font-semibold text-foreground">
          Tiempos de producción
        </h3>
        <ul className="mt-2 space-y-1 font-serif text-sm text-muted-foreground">
          <li>Productos estándar: 3–5 días hábiles</li>
          <li>Productos personalizados: 5–8 días hábiles adicionales</li>
          <li>El envío se realiza después de la producción</li>
        </ul>
      </div>
    </div>
  )
}
