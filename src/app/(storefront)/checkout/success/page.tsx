'use client'

import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  accountOrderDetail,
  login,
  purchaseCallbackByToken,
  register,
  routes,
} from '@/src/config/routes'
import { useSession } from '@/src/lib/auth/auth-client'
import {
  useCheckoutResultByTokenQuery,
  useOrderByNumberQuery,
  type CheckoutResult,
} from '@/src/features/storefront/checkout'
import {
  clearCheckoutConfirmation,
  readCheckoutConfirmationRaw,
  subscribeCheckoutConfirmation,
  type CheckoutConfirmationSession,
} from '@/src/features/storefront/checkout/lib/checkout-session'
import { getPaymentStatusUi } from '@/src/features/storefront/checkout/lib/payment-status-ui'
import {
  getPaymentConfirmationActions,
  getVerifyAgainResultMessage,
  resolvePaymentConfirmationUxState,
} from '@/src/features/storefront/checkout/lib/payment-confirmation-state'
import { CHECKOUT_CONFIRMATION_VISUAL_MS } from '@/src/features/storefront/checkout/lib/checkout-polling.config'
import { useCheckoutResultPolling } from '@/src/features/storefront/checkout/lib/use-checkout-result-polling'
import { usePaymentConfirmationElapsed } from '@/src/features/storefront/checkout/lib/use-payment-confirmation-elapsed'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import {
  mapCheckoutResultToOrderDetailViewModel,
  mapPublicOrderToOrderDetailViewModel,
  PurchaseDetailPageContent,
} from '@/src/features/storefront/orders'
function parseConfirmationSession(raw: string | null): CheckoutConfirmationSession | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as CheckoutConfirmationSession
  } catch {
    return null
  }
}

function parseConfirmationEmail(raw: string | null): string {
  return parseConfirmationSession(raw)?.email?.trim() ?? ''
}

function parseConfirmationReturnToken(raw: string | null): string {
  return parseConfirmationSession(raw)?.returnToken?.trim() ?? ''
}

function shouldShowManualRetryPayment(
  state: ReturnType<typeof resolvePaymentConfirmationUxState>,
): boolean {
  return (
    state === 'failed' ||
    state === 'expired' ||
    state === 'cancelled' ||
    state === 'pendingAfterTimeout'
  )
}

function CheckoutSuccessLoading() {
  return (
    <CheckoutLayout>
      <div
        data-testid="checkout-success-page"
        className="mx-auto max-w-5xl space-y-4 py-8"
      >
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </CheckoutLayout>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}

function CheckoutSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTokenFromUrl = searchParams.get('token')?.trim() ?? ''
  const orderNumberLegacy = searchParams.get('orderNumber')?.trim() ?? ''
  const paymentReturnHint = searchParams.get('payment')
  const { data: authSession } = useSession()

  const confirmationRaw = useSyncExternalStore(
    subscribeCheckoutConfirmation,
    readCheckoutConfirmationRaw,
    () => null,
  )

  const storedSession = useMemo(
    () => parseConfirmationSession(confirmationRaw),
    [confirmationRaw],
  )

  const [email] = useState(() => parseConfirmationEmail(readCheckoutConfirmationRaw()))
  const [storedReturnToken] = useState(() =>
    parseConfirmationReturnToken(readCheckoutConfirmationRaw()),
  )
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null)
  const [confirmingStartedAt] = useState(() => Date.now())
  const ownerRedirectDone = useRef(false)

  const effectiveToken = returnTokenFromUrl || storedReturnToken

  const tokenQuery = useCheckoutResultByTokenQuery({
    token: effectiveToken,
    enabled: effectiveToken.length > 0,
    pollWhilePending: false,
  })

  const legacyQuery = useOrderByNumberQuery({
    orderNumber: orderNumberLegacy,
    email,
    enabled: !effectiveToken && orderNumberLegacy.length > 0 && email.length > 0,
    pollWhilePending: false,
  })

  const checkoutResult = tokenQuery.data
  const legacyOrder = legacyQuery.data

  const paymentReturnRefetchDone = useRef(false)
  useEffect(() => {
    if (!paymentReturnHint || paymentReturnRefetchDone.current) return
    paymentReturnRefetchDone.current = true
    if (effectiveToken) {
      void tokenQuery.refetch()
    } else if (orderNumberLegacy && email) {
      void legacyQuery.refetch()
    }
  }, [paymentReturnHint, effectiveToken, orderNumberLegacy, email, tokenQuery, legacyQuery])

  const activeStatus =
    checkoutResult?.status ?? legacyOrder?.status ?? storedSession?.status ?? 'PENDING_PAYMENT'
  const activePaymentStatus =
    checkoutResult?.paymentStatus ??
    legacyOrder?.paymentStatus ??
    storedSession?.paymentStatus ??
    'PENDING'

  const statusUi = useMemo(
    () =>
      getPaymentStatusUi({
        orderStatus: activeStatus,
        paymentStatus: activePaymentStatus,
      }),
    [activeStatus, activePaymentStatus],
  )

  const hasOrderData = Boolean(checkoutResult || legacyOrder || storedSession)
  const isQueryLoading =
    (effectiveToken.length > 0 && tokenQuery.isLoading && !checkoutResult) ||
    (!effectiveToken && legacyQuery.isLoading && !legacyOrder && !storedSession)

  const isAwaitingConfirmation = useMemo(() => {
    const orderStatus = activeStatus.trim().toUpperCase()
    const paymentStatus = activePaymentStatus.trim().toUpperCase()
    if (orderStatus === 'PAID' || paymentStatus === 'PAID') return false
    if (paymentStatus === 'FAILED' || orderStatus === 'PAYMENT_FAILED') return false
    if (paymentStatus === 'CANCELLED' || orderStatus === 'CANCELLED') return false
    if (paymentStatus === 'EXPIRED') return false
    return true
  }, [activeStatus, activePaymentStatus])

  const elapsedMs = usePaymentConfirmationElapsed(
    isAwaitingConfirmation && (hasOrderData || isQueryLoading),
    confirmingStartedAt,
  )

  const confirmationState = useMemo(
    () =>
      resolvePaymentConfirmationUxState({
        orderStatus: activeStatus,
        paymentStatus: activePaymentStatus,
        isQueryLoading,
        hasOrderData,
        elapsedMs,
      }),
    [activeStatus, activePaymentStatus, isQueryLoading, hasOrderData, elapsedMs],
  )

  const confirmationActions = useMemo(
    () =>
      getPaymentConfirmationActions(confirmationState, {
        canRetryPayment: statusUi.canRetryPayment,
      }),
    [confirmationState, statusUi.canRetryPayment],
  )

  const shouldPollCheckout = useMemo(() => {
    if (!isAwaitingConfirmation) return false
    if (elapsedMs >= CHECKOUT_CONFIRMATION_VISUAL_MS) return false
    return confirmationActions.shouldPoll
  }, [isAwaitingConfirmation, elapsedMs, confirmationActions.shouldPoll])

  useCheckoutResultPolling({
    shouldPoll: shouldPollCheckout && effectiveToken.length > 0,
    refetch: tokenQuery.refetch,
    resetKey: `token:${effectiveToken}:${shouldPollCheckout}`,
  })

  useCheckoutResultPolling({
    shouldPoll:
      shouldPollCheckout &&
      effectiveToken.length === 0 &&
      orderNumberLegacy.length > 0 &&
      email.length > 0,
    refetch: legacyQuery.refetch,
    resetKey: `legacy:${orderNumberLegacy}:${email}:${shouldPollCheckout}`,
  })

  useEffect(() => {
    if (activePaymentStatus === 'PAID' || activeStatus === 'PAID') {
      clearCheckoutConfirmation()
    }
  }, [activeStatus, activePaymentStatus])

  const isAuthenticated = Boolean(authSession?.user)

  useEffect(() => {
    if (ownerRedirectDone.current) return
    if (!checkoutResult?.canViewDetails || !checkoutResult.orderNumber) return
    if (isQueryLoading) return

    ownerRedirectDone.current = true
    router.replace(
      accountOrderDetail(checkoutResult.orderNumber, { from: 'checkout' }),
    )
  }, [checkoutResult?.canViewDetails, checkoutResult?.orderNumber, isQueryLoading, router])

  const handleVerifyAgain = async () => {
    setIsVerifying(true)
    setVerifyMessage(null)
    try {
      if (effectiveToken) {
        const result = await tokenQuery.refetch()
        if (result.data) {
          setVerifyMessage(
            getVerifyAgainResultMessage(result.data.status, result.data.paymentStatus),
          )
        } else {
          setVerifyMessage('No pudimos verificar el estado. Intenta de nuevo.')
        }
        return
      }
      if (orderNumberLegacy && email) {
        const result = await legacyQuery.refetch()
        if (result.data) {
          setVerifyMessage(
            getVerifyAgainResultMessage(result.data.status, result.data.paymentStatus),
          )
        } else {
          setVerifyMessage('No pudimos verificar el estado. Intenta de nuevo.')
        }
      }
    } catch {
      setVerifyMessage('No pudimos verificar el estado. Intenta de nuevo.')
    } finally {
      setIsVerifying(false)
    }
  }

  const isPolling =
    shouldPollCheckout &&
    ((tokenQuery.isFetching && Boolean(effectiveToken)) ||
      (legacyQuery.isFetching && !effectiveToken))

  const purchaseCallbackPath =
    effectiveToken.length > 0
      ? purchaseCallbackByToken(effectiveToken)
      : checkoutResult?.orderNumber
        ? accountOrderDetail(checkoutResult.orderNumber, { from: 'checkout' })
        : undefined

  const purchaseAuthUrls = {
    loginUrl: purchaseCallbackPath
      ? login({ callbackUrl: purchaseCallbackPath })
      : routes.login,
    registerUrl: purchaseCallbackPath
      ? register({ callbackUrl: purchaseCallbackPath })
      : routes.register,
  }

  if (!effectiveToken && !orderNumberLegacy && !storedSession) {
    return (
      <CheckoutLayout>
        <div data-testid="checkout-success-page" className="mx-auto max-w-lg py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-sans text-xl font-bold">Pedido no encontrado</h1>
          <p className="mt-2 font-serif text-muted-foreground">
            Falta el enlace de confirmación. Revisa tu correo o contacta soporte.
          </p>
          <Button asChild className="mt-6 font-sans">
            <Link href={routes.shop}>Seguir comprando</Link>
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  if (effectiveToken && tokenQuery.isLoading && !checkoutResult) {
    return <CheckoutSuccessLoading />
  }

  if (effectiveToken && tokenQuery.isError && !checkoutResult) {
    return (
      <CheckoutLayout>
        <div data-testid="checkout-success-page" className="mx-auto max-w-lg py-16 text-center">
          <Alert variant="destructive" className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-serif">
              No pudimos cargar tu pedido. Verifica tu conexión e intenta de nuevo.
            </AlertDescription>
          </Alert>
          <Button className="mt-6 font-sans" onClick={() => void tokenQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  if (checkoutResult?.canViewDetails) {
    return <CheckoutSuccessLoading />
  }

  if (checkoutResult) {
    const order = mapCheckoutResultToOrderDetailViewModel(checkoutResult)
    const claimUrl = storedSession?.claimUrl ?? checkoutResult.claimUrl

    return (
      <CheckoutLayout>
        <div data-testid="checkout-success-page" className="mx-auto max-w-5xl py-8">
          <PurchaseDetailPageContent
            order={order}
            confirmationState={confirmationState}
            elapsedMs={elapsedMs}
            isPolling={isPolling}
            isAuthenticated={isAuthenticated}
            canViewDetails={checkoutResult.canViewDetails}
            viewerEmailMatchesOrder={checkoutResult.viewerEmailMatchesOrder}
            loginUrl={checkoutResult.loginUrl ?? purchaseAuthUrls.loginUrl}
            registerUrl={checkoutResult.registerUrl ?? purchaseAuthUrls.registerUrl}
            claimUrl={claimUrl}
            returnToken={effectiveToken}
            legacyEmail={storedSession?.email ?? email}
            tokenExpired={checkoutResult.tokenExpired}
            onVerifyAgain={() => void handleVerifyAgain()}
            isVerifying={isVerifying}
            verifyMessage={verifyMessage}
            showManualRetryPayment={shouldShowManualRetryPayment(confirmationState)}
            paymentReference={checkoutResult.paymentReference}
            paymentExpiresAt={checkoutResult.paymentExpiresAt}
            cashPaymentLocations={checkoutResult.cashPaymentLocations}
          />
        </div>
      </CheckoutLayout>
    )
  }

  if (!effectiveToken && !email && !storedSession) {
    return (
      <CheckoutLayout>
        <div data-testid="checkout-success-page" className="mx-auto max-w-lg py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-sans text-xl font-bold">Confirma tu pedido</h1>
          <p className="mt-2 font-serif text-muted-foreground">
            Para ver el estado del pago, abre esta página desde el mismo navegador donde
            completaste el checkout o inicia sesión en tu cuenta.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="font-sans">
              <Link href={routes.login}>Iniciar sesión</Link>
            </Button>
            <Button asChild className="font-sans">
              <Link href={routes.shop}>Seguir comprando</Link>
            </Button>
          </div>
        </div>
      </CheckoutLayout>
    )
  }

  if (legacyQuery.isLoading && !legacyOrder && !storedSession) {
    return <CheckoutSuccessLoading />
  }

  if (legacyOrder) {
    const order = mapPublicOrderToOrderDetailViewModel(legacyOrder)

    return (
      <CheckoutLayout>
        <div data-testid="checkout-success-page" className="mx-auto max-w-5xl py-8">
          <PurchaseDetailPageContent
            order={order}
            confirmationState={confirmationState}
            elapsedMs={elapsedMs}
            isPolling={isPolling}
            isAuthenticated={isAuthenticated}
            loginUrl={purchaseAuthUrls.loginUrl}
            registerUrl={purchaseAuthUrls.registerUrl}
            claimUrl={storedSession?.claimUrl}
            legacyEmail={legacyOrder.customerEmail}
            onVerifyAgain={() => void handleVerifyAgain()}
            isVerifying={isVerifying}
            verifyMessage={verifyMessage}
            showManualRetryPayment={shouldShowManualRetryPayment(confirmationState)}
          />
        </div>
      </CheckoutLayout>
    )
  }

  if (storedSession && storedSession.orderNumber === orderNumberLegacy) {
    const fallbackOrder = mapCheckoutResultToOrderDetailViewModel({
      orderNumber: storedSession.orderNumber,
      orderId: storedSession.orderId,
      status: storedSession.status,
      paymentStatus: storedSession.paymentStatus,
      fulfillmentStatus: 'UNFULFILLED',
      totalCents: storedSession.totalCents,
      shippingCents: storedSession.shippingCents,
      subtotalCents: storedSession.totalCents - storedSession.shippingCents,
      currency: storedSession.currency,
      paymentMethod: storedSession.paymentMethod,
      createdAt: new Date().toISOString(),
      maskedCustomerEmail: storedSession.email,
      items: [],
      payments: [],
      shipments: [],
      events: [],
      paymentActions: {
        canVerifyPayment: false,
        canContinuePayment: false,
        canRetryPayment: false,
        paymentRedirectUrl: null,
      },
      canViewDetails: false,
      viewerEmailMatchesOrder: false,
      returnTokenValid: true,
      tokenExpired: false,
      loginUrl: purchaseAuthUrls.loginUrl,
      registerUrl: purchaseAuthUrls.registerUrl,
    } satisfies CheckoutResult)

    return (
      <CheckoutLayout>
        <div data-testid="checkout-success-page" className="mx-auto max-w-5xl space-y-6 py-8">
          {legacyQuery.isError && (
            <Alert>
              <AlertDescription className="font-serif text-sm text-muted-foreground">
                Mostramos los datos de tu confirmación reciente. El detalle completo se cargará
                cuando la conexión esté disponible.
              </AlertDescription>
            </Alert>
          )}
          <PurchaseDetailPageContent
            order={fallbackOrder}
            confirmationState={confirmationState}
            elapsedMs={elapsedMs}
            isPolling={isPolling}
            isAuthenticated={isAuthenticated}
            loginUrl={purchaseAuthUrls.loginUrl}
            registerUrl={purchaseAuthUrls.registerUrl}
            claimUrl={storedSession.claimUrl}
            returnToken={storedSession.returnToken}
            legacyEmail={storedSession.email}
            onVerifyAgain={() => void handleVerifyAgain()}
            isVerifying={isVerifying}
            verifyMessage={verifyMessage}
            showManualRetryPayment={shouldShowManualRetryPayment(confirmationState)}
          />
        </div>
      </CheckoutLayout>
    )
  }

  return (
    <CheckoutLayout>
      <div data-testid="checkout-success-page" className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-sans text-xl font-bold">No pudimos mostrar tu pedido</h1>
        <p className="mt-2 font-serif text-muted-foreground">
          Si acabas de completar el checkout, intenta desde el mismo navegador. Para consultar un
          pedido anterior revisa el correo de confirmación.
        </p>
        <Button asChild className="mt-6 font-sans">
          <Link href={routes.shop}>Seguir comprando</Link>
        </Button>
      </div>
    </CheckoutLayout>
  )
}
