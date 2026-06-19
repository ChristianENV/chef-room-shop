'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, Package, Truck } from 'lucide-react'

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
import {
  OTHER_RATES_PAGE_SIZE,
  OTHER_RATES_PREVIEW_COUNT,
  buildOtherShippingRates,
  buildShippingRateHighlights,
  dedupeShippingRates,
  formatQuoteExpiresAt,
  paginateOtherRates,
  sortShippingRates,
  type ShippingRateViewMode,
} from '../lib/shipping-rate-ranking'
import type { ShippingQuotePayload, ShippingRate } from '../types'
import { ShippingQuoteEmpty } from './shipping-quote-empty'
import { ShippingQuoteError } from './shipping-quote-error'
import { ShippingQuoteLoading } from './shipping-quote-loading'
import { ShippingRateCard } from './shipping-rate-card'

const MX_POSTAL_REGEX = /^\d{5}$/
const POLL_INTERVAL_MS = 2500
const MAX_POLL_ATTEMPTS = 12

const SELECT_RATE_ERROR = 'No pudimos guardar esta tarifa. Intenta de nuevo.'

const VIEW_MODE_LABELS: Record<ShippingRateViewMode, string> = {
  highlights: 'Destacadas',
  all: 'Todas',
  cheapest: 'Económicas',
  fastest: 'Rápidas',
  carrier: 'Por paquetería',
}

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

function toSelection(rate: ShippingRate, quoteId: string): SelectedShippingRateSummary {
  return {
    rateId: rate.id,
    quoteId,
    carrier: rate.carrier,
    service: rate.service,
    amountCents: rate.amountCents,
    estimatedDays: rate.estimatedDays,
  }
}

function formatPackageHint(packageJson: unknown): string | null {
  if (!packageJson || typeof packageJson !== 'object') return null
  const pkg = packageJson as Record<string, unknown>
  const length = pkg.lengthCm ?? pkg.length
  const width = pkg.widthCm ?? pkg.width
  const height = pkg.heightCm ?? pkg.height
  const weight = pkg.weightKg ?? pkg.weight
  if (
    typeof length === 'number' &&
    typeof width === 'number' &&
    typeof height === 'number' &&
    typeof weight === 'number'
  ) {
    return `Paquete estimado: ${length}×${width}×${height} cm · ${weight} kg`
  }
  return 'Paquete estimado según tu carrito'
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
  const [showOtherOptions, setShowOtherOptions] = useState(false)
  const [otherVisibleCount, setOtherVisibleCount] = useState(OTHER_RATES_PAGE_SIZE)
  const [otherViewMode, setOtherViewMode] = useState<ShippingRateViewMode>('all')
  const [selectingRateId, setSelectingRateId] = useState<string | null>(null)

  const createQuote = useCreateShippingQuoteMutation()
  const refreshQuote = useRefreshShippingQuoteMutation()
  const selectRate = useSelectShippingRateMutation()

  const postalCode = destinationPostalCode.trim()
  const canQuote =
    MX_POSTAL_REGEX.test(postalCode) &&
    Boolean(destinationCity?.trim()) &&
    Boolean(destinationState?.trim()) &&
    !disabled

  const isQuoting = createQuote.isPending || refreshQuote.isPending
  const isSelecting = selectRate.isPending
  const isBusy = isQuoting || isSelecting

  const rawRates = useMemo(() => payload?.quote.rates ?? [], [payload?.quote.rates])
  const recommendedRate = payload?.recommendedRate ?? null

  const dedupedRates = useMemo(
    () => dedupeShippingRates(rawRates, recommendedRate),
    [rawRates, recommendedRate],
  )

  const highlights = useMemo(
    () => buildShippingRateHighlights(rawRates, recommendedRate, selectedRateId ?? null),
    [rawRates, recommendedRate, selectedRateId],
  )

  const otherRatesBase = useMemo(
    () =>
      buildOtherShippingRates(
        rawRates,
        highlights.cards.map((c) => c.rate),
        recommendedRate,
      ),
    [rawRates, highlights.cards, recommendedRate],
  )

  const otherRatesSorted = useMemo(
    () => sortShippingRates(otherRatesBase, otherViewMode),
    [otherRatesBase, otherViewMode],
  )

  const otherPaginated = useMemo(
    () => paginateOtherRates(otherRatesSorted, otherVisibleCount),
    [otherRatesSorted, otherVisibleCount],
  )

  const otherRatesPreview = useMemo(
    () => otherRatesSorted.slice(0, OTHER_RATES_PREVIEW_COUNT),
    [otherRatesSorted],
  )

  const quoteExpiresLabel = formatQuoteExpiresAt(payload?.quote.expiresAt ?? null)
  const packageHint = formatPackageHint(payload?.quote.packageJson ?? null)

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
    setShowOtherOptions(false)
    setOtherVisibleCount(OTHER_RATES_PAGE_SIZE)
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
      if (!payload || disabled || isSelecting) return
      setUserError(null)
      setSelectingRateId(rate.id)
      try {
        const result = await selectRate.mutateAsync(rate.id)
        applyPayload(result)
        const fromBff =
          result.quote.rates.find((r) => r.selectedAt) ??
          result.quote.rates.find((r) => r.id === rate.id) ??
          rate
        onRateSelected(toSelection(fromBff, result.quote.id))
      } catch {
        setUserError(SELECT_RATE_ERROR)
      } finally {
        setSelectingRateId(null)
      }
    },
    [applyPayload, disabled, isSelecting, onRateSelected, payload, selectRate],
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
  }, [applyPayload, payload?.quote.id, payload?.quote.isCompleted, pollAttempts, refreshQuote])

  const showPollingMessage =
    Boolean(payload) && !payload?.quote.isCompleted && dedupedRates.length === 0

  const totalOtherCount = otherRatesBase.length
  const hiddenOtherCount = Math.max(0, totalOtherCount - OTHER_RATES_PREVIEW_COUNT)
  const visibleOtherRates = showOtherOptions ? otherPaginated.visible : otherRatesPreview
  const hasRates = dedupedRates.length > 0

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="font-sans text-lg font-semibold text-foreground">Elige tu envío</h2>
        </div>
        {payload && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-serif text-sm text-muted-foreground">
            <span>CP destino: {payload.quote.destinationPostalCode}</span>
            {packageHint && (
              <span className="inline-flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                {packageHint}
              </span>
            )}
            {quoteExpiresLabel && <span>Tarifas vigentes hasta {quoteExpiresLabel}</span>}
          </div>
        )}
      </div>

      {hasCustomization && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
          <p className="font-serif text-sm text-warning">
            Tu pedido incluye productos personalizados. El tiempo de producción es adicional al
            tiempo de envío mostrado por la paquetería.
          </p>
        </div>
      )}

      {!payload && (
        <p className="font-serif text-sm text-muted-foreground">
          Cotizamos el envío con el contenido actual de tu carrito. No necesitas indicar peso ni
          medidas del paquete.
        </p>
      )}

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
            canQuote && !skydropxUnavailable && !isSelecting ? () => void handleQuote() : undefined
          }
        />
      )}

      {isQuoting && !payload && <ShippingQuoteLoading />}

      {showPollingMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="font-serif text-sm text-muted-foreground">
            Estamos buscando mejores tarifas…
          </p>
        </div>
      )}

      {payload && dedupedRates.length === 0 && payload.quote.isCompleted && !isBusy && (
        <ShippingQuoteEmpty />
      )}

      {hasRates && (
        <div className="space-y-6">
          <section className="space-y-3" aria-labelledby="shipping-highlights-heading">
            <h3
              id="shipping-highlights-heading"
              className="font-sans text-sm font-semibold uppercase tracking-wide text-foreground"
            >
              Opciones destacadas
            </h3>
            <div className="space-y-3">
              {highlights.cards.map(({ rate, badges }) => (
                <ShippingRateCard
                  key={rate.id}
                  rate={rate}
                  badges={badges}
                  selected={selectedRateId === rate.id}
                  isSelecting={selectingRateId === rate.id}
                  disabled={disabled || isQuoting}
                  onSelect={() => void handleSelectRate(rate)}
                />
              ))}
            </div>
          </section>

          {totalOtherCount > 0 && (
            <section className="space-y-3" aria-labelledby="shipping-other-heading">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  id="shipping-other-heading"
                  className="font-sans text-sm font-semibold text-foreground"
                >
                  Más opciones de envío
                </h3>
                {hiddenOtherCount > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="font-sans text-primary"
                    onClick={() => {
                      setShowOtherOptions((open) => !open)
                      if (showOtherOptions) {
                        setOtherVisibleCount(OTHER_RATES_PAGE_SIZE)
                      }
                    }}
                  >
                    {showOtherOptions ? (
                      <>
                        <ChevronUp className="mr-1 h-4 w-4" />
                        Ocultar tarifas adicionales
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-1 h-4 w-4" />
                        Ver más tarifas ({hiddenOtherCount})
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Filtrar tarifas de envío"
              >
                {(['all', 'cheapest', 'fastest', 'carrier'] as ShippingRateViewMode[]).map(
                  (mode) => (
                    <Button
                      key={mode}
                      type="button"
                      size="sm"
                      variant={otherViewMode === mode ? 'default' : 'outline'}
                      className="font-sans"
                      role="tab"
                      aria-selected={otherViewMode === mode}
                      onClick={() => {
                        setOtherViewMode(mode)
                        setOtherVisibleCount(OTHER_RATES_PAGE_SIZE)
                      }}
                    >
                      {VIEW_MODE_LABELS[mode]}
                    </Button>
                  ),
                )}
              </div>

              <div className="space-y-3">
                {visibleOtherRates.map((rate) => (
                  <ShippingRateCard
                    key={rate.id}
                    rate={rate}
                    selected={selectedRateId === rate.id}
                    isSelecting={selectingRateId === rate.id}
                    disabled={disabled || isQuoting}
                    onSelect={() => void handleSelectRate(rate)}
                  />
                ))}
              </div>

              {showOtherOptions && otherPaginated.hasMore && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full font-sans"
                  onClick={() => setOtherVisibleCount((n) => n + OTHER_RATES_PAGE_SIZE)}
                >
                  Mostrar más ({otherPaginated.remaining} restantes)
                </Button>
              )}
            </section>
          )}
        </div>
      )}

      <div className="rounded-lg bg-secondary/50 p-4">
        <h3 className="font-sans text-sm font-semibold text-foreground">Tiempos de producción</h3>
        <ul className="mt-2 space-y-1 font-serif text-sm text-muted-foreground">
          <li>Productos estándar: 3–5 días hábiles</li>
          <li>Productos personalizados: 5–8 días hábiles adicionales</li>
          <li>El envío se realiza después de la producción</li>
        </ul>
      </div>
    </div>
  )
}
