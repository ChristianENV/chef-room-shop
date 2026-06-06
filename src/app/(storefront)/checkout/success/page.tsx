'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { postCheckoutOrderDetail, routes } from '@/src/config/routes'
import { useCheckoutResultByTokenQuery } from '@/src/features/storefront/checkout'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'

function CheckoutSuccessBridge() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''

  const tokenQuery = useCheckoutResultByTokenQuery({
    token,
    enabled: token.length > 0,
    pollWhilePending: false,
  })

  const orderNumber = tokenQuery.data?.orderNumber?.trim() ?? ''

  useEffect(() => {
    if (!orderNumber || !token) {
      return
    }
    router.replace(postCheckoutOrderDetail(orderNumber, token))
  }, [orderNumber, token, router])

  if (!token) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-lg space-y-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-serif">
              No encontramos la información de tu compra. Revisa el enlace o contacta a soporte.
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="font-sans">
            <Link href={routes.contact}>Contactar soporte</Link>
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  if (tokenQuery.isLoading || orderNumber) {
    return (
      <CheckoutLayout>
        <div
          data-testid="checkout-success-redirecting"
          className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
          <p className="font-sans text-lg font-semibold text-foreground">
            Preparando el detalle de tu pedido…
          </p>
          <p className="font-serif text-sm text-muted-foreground">
            Te redirigiremos en un momento.
          </p>
        </div>
      </CheckoutLayout>
    )
  }

  if (tokenQuery.isError || !tokenQuery.data) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-lg space-y-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-serif">
              No pudimos recuperar tu pedido. El enlace puede haber expirado.
            </AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="font-sans">
            <Link href={routes.contact}>Contactar soporte</Link>
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  return null
}

function CheckoutSuccessFallback() {
  return (
    <CheckoutLayout>
      <div className="mx-auto max-w-lg space-y-4 py-12">
        <Skeleton className="mx-auto h-8 w-8 rounded-full" />
        <Skeleton className="mx-auto h-6 w-64" />
        <Skeleton className="mx-auto h-4 w-48" />
      </div>
    </CheckoutLayout>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessBridge />
    </Suspense>
  )
}
