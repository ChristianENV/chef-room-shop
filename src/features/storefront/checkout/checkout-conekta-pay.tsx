'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useRetryCheckoutPaymentMutation } from './api/use-retry-checkout-payment-mutation'
import { useCreateConektaCheckoutMutation } from './api/use-create-conekta-checkout-mutation'

type CheckoutConektaPayProps = {
  returnToken?: string | null
  /** Legacy fallback when token is unavailable */
  orderNumber?: string
  email?: string
  disabled?: boolean
  /**
   * When true, redirects to Conekta on mount. Must stay false on /checkout/success;
   * retry is always user-initiated there.
   */
  autoRedirect?: boolean
}

/**
 * Retry-only Conekta checkout — redirects in the same tab.
 */
export function CheckoutConektaPay({
  returnToken,
  orderNumber,
  email,
  disabled = false,
  autoRedirect = false,
}: CheckoutConektaPayProps) {
  const retryCheckout = useRetryCheckoutPaymentMutation()
  const legacyCheckout = useCreateConektaCheckoutMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const startedRef = useRef(false)

  const isPending = retryCheckout.isPending || legacyCheckout.isPending

  const startRetry = async () => {
    if (disabled || isPending) return
    setErrorMessage(null)

    try {
      if (returnToken) {
        const result = await retryCheckout.mutateAsync(returnToken)
        if (result.paymentRedirectUrl) {
          window.location.assign(result.paymentRedirectUrl)
          return
        }
      } else if (orderNumber && email) {
        const result = await legacyCheckout.mutateAsync({ orderNumber, email })
        if (result.checkoutUrl) {
          window.location.assign(result.checkoutUrl)
          return
        }
      }

      setErrorMessage('No pudimos preparar el pago. Intenta nuevamente.')
    } catch {
      setErrorMessage('No pudimos preparar el pago. Intenta nuevamente.')
    }
  }

  useEffect(() => {
    if (!autoRedirect || disabled || startedRef.current) return
    if (!returnToken && !(orderNumber && email)) return
    startedRef.current = true
    queueMicrotask(() => {
      void startRetry()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for auto retry
  }, [autoRedirect, disabled, returnToken, orderNumber, email])

  if (disabled) {
    return null
  }

  if (isPending && !errorMessage) {
    return (
      <div className="mt-6 flex items-center gap-2 font-serif text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Generando nuevo enlace de pago…
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="mt-6 space-y-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-serif">{errorMessage}</AlertDescription>
        </Alert>
        <Button
          type="button"
          onClick={() => void startRetry()}
          disabled={isPending}
          className="font-sans"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Reintentar pago
        </Button>
      </div>
    )
  }

  if (autoRedirect) {
    return (
      <div className="mt-6 flex items-center gap-2 font-serif text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Redirigiendo al pago seguro…
      </div>
    )
  }

  return (
    <div className="mt-6">
      <Button
        type="button"
        size="lg"
        onClick={() => void startRetry()}
        disabled={isPending}
        className="w-full font-sans font-semibold sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        {autoRedirect ? 'Reintentar pago' : 'Generar nuevo enlace de pago'}
      </Button>
    </div>
  )
}
