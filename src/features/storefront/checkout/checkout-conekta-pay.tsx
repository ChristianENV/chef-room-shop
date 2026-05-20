'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { useCreateConektaCheckoutMutation } from './api/use-create-conekta-checkout-mutation'

type CheckoutConektaPayProps = {
  orderNumber: string
  email: string
  disabled?: boolean
}

/**
 * Starts Conekta hosted checkout and renders pay / retry CTA.
 */
export function CheckoutConektaPay({ orderNumber, email, disabled }: CheckoutConektaPayProps) {
  const conektaCheckout = useCreateConektaCheckoutMutation()
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  const startCheckout = async () => {
    if (!orderNumber || !email || disabled) return
    setStarted(true)
    setErrorMessage(null)
    try {
      const result = await conektaCheckout.mutateAsync({
        orderNumber,
        email,
      })
      if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl)
      } else {
        setErrorMessage(
          'Tu pedido fue creado, pero no pudimos iniciar el pago. Intenta de nuevo.',
        )
      }
    } catch {
      setErrorMessage(
        'Tu pedido fue creado, pero no pudimos iniciar el pago. Intenta de nuevo.',
      )
    }
  }

  if (disabled) {
    return null
  }

  if (!started) {
    return (
      <div className="mt-6 space-y-3">
        <p className="font-serif text-sm text-muted-foreground">
          Serás redirigido a Conekta para completar el pago de forma segura. No capturamos datos de
          tarjeta en Chef Room.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={() => void startCheckout()}
          className="w-full font-sans font-semibold sm:w-auto"
        >
          Preparar pago con Conekta
        </Button>
      </div>
    )
  }

  if (conektaCheckout.isPending && !checkoutUrl) {
    return (
      <div className="mt-6 flex items-center gap-2 font-serif text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparando pago seguro con Conekta…
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
          onClick={() => void startCheckout()}
          disabled={conektaCheckout.isPending}
          className="font-sans"
        >
          {conektaCheckout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reintentar pago
        </Button>
      </div>
    )
  }

  if (!checkoutUrl) {
    return (
      <Alert className="mt-6 border-warning/30 bg-warning/5">
        <AlertCircle className="h-4 w-4 text-warning" />
        <AlertDescription className="font-serif text-sm">
          El checkout de Conekta no está disponible. Verifica la configuración del servidor o
          intenta más tarde.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      <p className="font-serif text-sm text-muted-foreground">
        Tu enlace de pago está listo. Completa el pago en la página segura de Conekta.
      </p>
      <Button asChild size="lg" className="w-full font-sans font-semibold sm:w-auto">
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          Pagar ahora
        </a>
      </Button>
    </div>
  )
}
