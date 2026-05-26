'use client'

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import {
  useCheckoutResultByTokenQuery,
  useOrderByNumberQuery,
  type CheckoutResult,
  type PublicOrder,
} from '@/src/features/storefront/checkout'
import {
  clearCheckoutConfirmation,
  readCheckoutConfirmationRaw,
  subscribeCheckoutConfirmation,
  type CheckoutConfirmationSession,
} from '@/src/features/storefront/checkout/lib/checkout-session'
import { getPaymentStatusUi } from '@/src/features/storefront/checkout/lib/payment-status-ui'
import { CheckoutConektaPay } from '@/src/features/storefront/checkout/checkout-conekta-pay'
import { CheckoutPaymentStatusBanner } from '@/src/features/storefront/checkout/checkout-payment-status-banner'
import { resolvePaymentMethodLabel } from '@/src/config/payment-vars'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { routes } from '@/src/config/routes'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import { useSession } from '@/src/lib/auth/auth-client'
import {
  Package,
  CreditCard,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'

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

type OrderItem = PublicOrder['items'][number] | CheckoutResult['items'][number]

function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => {
        const linePesos = centsToPesos(item.totalPriceCents + item.customizationPriceCents)
        const snapshot = item.productSnapshotJson as { name?: string; sizeName?: string } | null
        const name = snapshot?.name ?? item.name ?? 'Producto'
        const size = snapshot?.sizeName

        return (
          <li key={item.id} className="flex items-start justify-between gap-4 font-serif text-sm">
            <div>
              <p className="font-sans font-medium text-foreground">{name}</p>
              {size && <p className="text-muted-foreground">Talla: {size}</p>}
              <p className="text-muted-foreground">Cant: {item.quantity}</p>
            </div>
            <span className="font-sans font-medium text-foreground">
              {formatCurrencyMXN(linePesos)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

type OrderConfirmationCardProps = {
  orderNumber: string
  statusUi: ReturnType<typeof getPaymentStatusUi>
  totalPesos: number
  paymentMethodLabel: string
  customerEmail?: string
  items?: OrderItem[]
  paymentReturnHint?: string | null
  isPolling?: boolean
  returnToken?: string | null
  legacyOrderNumber?: string
  legacyEmail?: string
  paymentReference?: string | null
  paymentExpiresAt?: string | null
  cashPaymentLocations?: string[] | null
}

function OrderConfirmationCard({
  orderNumber,
  statusUi,
  totalPesos,
  paymentMethodLabel,
  customerEmail,
  items,
  paymentReturnHint,
  isPolling,
  returnToken,
  legacyOrderNumber,
  legacyEmail,
  paymentReference,
  paymentExpiresAt,
  cashPaymentLocations,
}: OrderConfirmationCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 md:p-8">
      <p className="font-serif text-sm text-muted-foreground">
        Número de pedido:{' '}
        <span className="font-sans font-semibold text-foreground">{orderNumber}</span>
      </p>

      <CheckoutPaymentStatusBanner
        statusUi={statusUi}
        isPolling={isPolling}
        paymentReturnHint={paymentReturnHint}
        className="mt-6"
      />

      <Separator className="my-6" />

      <dl className="grid gap-3 font-serif text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="font-sans text-lg font-bold text-foreground">
            {formatCurrencyMXN(totalPesos)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Método de pago</dt>
          <dd className="flex items-center gap-2 font-sans font-medium text-foreground">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            {paymentMethodLabel}
          </dd>
        </div>
        {customerEmail && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="font-sans font-medium text-foreground">{customerEmail}</dd>
          </div>
        )}
        {paymentReference && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Referencia de pago</dt>
            <dd className="font-sans font-medium text-foreground">{paymentReference}</dd>
          </div>
        )}
        {paymentExpiresAt && (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Vence</dt>
            <dd className="font-sans font-medium text-foreground">
              {new Date(paymentExpiresAt).toLocaleString('es-MX')}
            </dd>
          </div>
        )}
      </dl>

      {cashPaymentLocations && cashPaymentLocations.length > 0 && (
        <>
          <Separator className="my-6" />
          <div>
            <h3 className="font-sans text-sm font-semibold">Puntos de pago</h3>
            <ul className="mt-2 list-inside list-disc font-serif text-sm text-muted-foreground">
              {cashPaymentLocations.slice(0, 10).map((location) => (
                <li key={location}>{location}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {items && items.length > 0 && (
        <>
          <Separator className="my-6" />
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="font-sans text-lg font-semibold">Artículos</h2>
          </div>
          <OrderItemsList items={items} />
        </>
      )}

      {statusUi.canRetryPayment && (
        <CheckoutConektaPay
          returnToken={returnToken}
          orderNumber={legacyOrderNumber}
          email={legacyEmail}
          autoRedirect={Boolean(returnToken || (legacyOrderNumber && legacyEmail))}
        />
      )}
    </div>
  )
}

function CheckoutSuccessLoading() {
  return (
    <CheckoutLayout>
      <div className="mx-auto max-w-2xl space-y-4 py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </CheckoutLayout>
  )
}

type SuccessPageActionsProps = {
  isAuthenticated: boolean
  orderNumber: string
  claimUrl?: string | null
  accountOrderUrl?: string | null
  detailUrl?: string | null
  loginUrl?: string
  registerUrl?: string
  canViewDetails?: boolean
  onGuestDetailsClick?: () => void
}

function SuccessPageActions({
  isAuthenticated,
  orderNumber,
  claimUrl,
  accountOrderUrl,
  detailUrl,
  loginUrl = routes.login,
  registerUrl = routes.register,
  canViewDetails,
  onGuestDetailsClick,
}: SuccessPageActionsProps) {
  const orderDetailHref =
    detailUrl ??
    accountOrderUrl ??
    (isAuthenticated ? routes.accountOrderDetail(orderNumber) : null)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {canViewDetails && orderDetailHref && (
        <Button asChild className="font-sans">
          <Link href={orderDetailHref}>Ver pedido</Link>
        </Button>
      )}
      {!isAuthenticated && !canViewDetails && (
        <>
          <Button type="button" variant="default" className="font-sans" onClick={onGuestDetailsClick}>
            Ver detalle del pedido
          </Button>
          {claimUrl && (
            <Button asChild variant="outline" className="font-sans">
              <Link href={claimUrl}>Crear cuenta para ver seguimiento</Link>
            </Button>
          )}
        </>
      )}
      {!isAuthenticated && (
        <>
          <Button asChild variant="outline" className="font-sans">
            <Link href={loginUrl}>Iniciar sesión</Link>
          </Button>
          <Button asChild variant="outline" className="font-sans">
            <Link href={registerUrl}>Crear cuenta</Link>
          </Button>
        </>
      )}
      {isAuthenticated && !orderDetailHref && (
        <Button asChild variant="outline" className="font-sans">
          <Link href={routes.account}>Ir a mi cuenta</Link>
        </Button>
      )}
      <Button asChild variant="outline" className="font-sans">
        <Link href={routes.shop}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Seguir comprando
        </Link>
      </Button>
    </div>
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
  const [storedReturnToken] = useState(() => parseConfirmationReturnToken(readCheckoutConfirmationRaw()))
  const [guestDialogOpen, setGuestDialogOpen] = useState(false)

  const effectiveToken = returnTokenFromUrl || storedReturnToken

  const tokenQuery = useCheckoutResultByTokenQuery({
    token: effectiveToken,
    enabled: effectiveToken.length > 0,
    pollWhilePending: true,
  })

  const legacyQuery = useOrderByNumberQuery({
    orderNumber: orderNumberLegacy,
    email,
    enabled: !effectiveToken && orderNumberLegacy.length > 0 && email.length > 0,
    pollWhilePending: true,
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

  const activeStatus = checkoutResult?.status ?? legacyOrder?.status ?? storedSession?.status ?? 'PENDING_PAYMENT'
  const activePaymentStatus =
    checkoutResult?.paymentStatus ?? legacyOrder?.paymentStatus ?? storedSession?.paymentStatus ?? 'PENDING'

  const statusUi = useMemo(
    () =>
      getPaymentStatusUi({
        orderStatus: activeStatus,
        paymentStatus: activePaymentStatus,
      }),
    [activeStatus, activePaymentStatus],
  )

  useEffect(() => {
    if (activePaymentStatus === 'PAID' || activeStatus === 'PAID') {
      clearCheckoutConfirmation()
    }
  }, [activeStatus, activePaymentStatus])

  const paymentMethodLabel = useMemo(() => {
    if (checkoutResult?.paymentMethod) return resolvePaymentMethodLabel(checkoutResult.paymentMethod)
    if (legacyOrder?.payments[0]?.method) {
      return resolvePaymentMethodLabel(legacyOrder.payments[0].method)
    }
    return resolvePaymentMethodLabel(storedSession?.paymentMethod)
  }, [checkoutResult, legacyOrder, storedSession])

  const isAuthenticated = Boolean(authSession?.user)
  const isPolling =
    (tokenQuery.isFetching && statusUi.shouldPoll && Boolean(effectiveToken)) ||
    (legacyQuery.isFetching && statusUi.shouldPoll && !effectiveToken)

  if (!effectiveToken && !orderNumberLegacy && !storedSession) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
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
        <div className="mx-auto max-w-lg py-16 text-center">
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

  if (checkoutResult) {
    const totalPesos = centsToPesos(checkoutResult.totalCents)
    const claimUrl = storedSession?.claimUrl ?? checkoutResult.claimUrl

    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <OrderConfirmationCard
            orderNumber={checkoutResult.orderNumber}
            statusUi={statusUi}
            totalPesos={totalPesos}
            paymentMethodLabel={paymentMethodLabel}
            customerEmail={storedSession?.email}
            items={checkoutResult.items}
            paymentReturnHint={paymentReturnHint}
            isPolling={isPolling}
            returnToken={effectiveToken}
            paymentReference={checkoutResult.paymentReference}
            paymentExpiresAt={checkoutResult.paymentExpiresAt}
            cashPaymentLocations={checkoutResult.cashPaymentLocations}
          />
          <SuccessPageActions
            isAuthenticated={isAuthenticated}
            orderNumber={checkoutResult.orderNumber}
            claimUrl={claimUrl}
            accountOrderUrl={checkoutResult.accountOrderUrl ?? storedSession?.accountOrderUrl}
            detailUrl={checkoutResult.detailUrl}
            loginUrl={checkoutResult.loginUrl}
            registerUrl={checkoutResult.registerUrl}
            canViewDetails={checkoutResult.canViewDetails}
            onGuestDetailsClick={() => setGuestDialogOpen(true)}
          />
        </div>

        <Dialog open={guestDialogOpen} onOpenChange={setGuestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-sans">Ver detalle del pedido</DialogTitle>
              <DialogDescription className="font-serif">
                Inicia sesión o crea una cuenta para ver el seguimiento completo. También puedes
                usar el enlace del correo de confirmación si compraste como invitado.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="font-sans">
                <Link href={checkoutResult.loginUrl}>Iniciar sesión</Link>
              </Button>
              <Button asChild className="font-sans">
                <Link href={checkoutResult.registerUrl}>Crear cuenta</Link>
              </Button>
              {claimUrl && (
                <Button asChild variant="secondary" className="font-sans">
                  <Link href={claimUrl}>Reclamar pedido</Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CheckoutLayout>
    )
  }

  if (!effectiveToken && !email && !storedSession) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
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

  if (legacyQuery.isError && !legacyOrder && !storedSession) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
          <Alert variant="destructive" className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-serif">
              No pudimos cargar tu pedido. Verifica tu conexión e intenta de nuevo.
            </AlertDescription>
          </Alert>
          <Button className="mt-6 font-sans" onClick={() => void legacyQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  if (legacyOrder) {
    const totalPesos = centsToPesos(legacyOrder.totalCents)

    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <OrderConfirmationCard
            orderNumber={legacyOrder.orderNumber}
            statusUi={statusUi}
            totalPesos={totalPesos}
            paymentMethodLabel={paymentMethodLabel}
            customerEmail={legacyOrder.customerEmail}
            items={legacyOrder.items}
            paymentReturnHint={paymentReturnHint}
            isPolling={isPolling}
            legacyOrderNumber={legacyOrder.orderNumber}
            legacyEmail={legacyOrder.customerEmail}
          />
          <SuccessPageActions
            isAuthenticated={isAuthenticated}
            orderNumber={legacyOrder.orderNumber}
            claimUrl={storedSession?.claimUrl}
            accountOrderUrl={storedSession?.accountOrderUrl}
          />
        </div>
      </CheckoutLayout>
    )
  }

  if (storedSession && storedSession.orderNumber === orderNumberLegacy) {
    const totalPesos = centsToPesos(storedSession.totalCents)
    const fallbackStatusUi = getPaymentStatusUi({
      orderStatus: storedSession.status,
      paymentStatus: storedSession.paymentStatus,
    })

    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <OrderConfirmationCard
            orderNumber={storedSession.orderNumber}
            statusUi={fallbackStatusUi}
            totalPesos={totalPesos}
            paymentMethodLabel={resolvePaymentMethodLabel(storedSession.paymentMethod)}
            customerEmail={storedSession.email}
            paymentReturnHint={paymentReturnHint}
            isPolling={legacyQuery.isFetching && fallbackStatusUi.shouldPoll}
            returnToken={storedSession.returnToken}
            legacyOrderNumber={storedSession.orderNumber}
            legacyEmail={storedSession.email}
          />

          {legacyQuery.isError && (
            <Alert>
              <AlertDescription className="font-serif text-sm text-muted-foreground">
                Mostramos los datos de tu confirmación reciente. El detalle completo se cargará
                cuando la conexión esté disponible.
              </AlertDescription>
            </Alert>
          )}

          <SuccessPageActions
            isAuthenticated={isAuthenticated}
            orderNumber={storedSession.orderNumber}
            claimUrl={storedSession.claimUrl}
            accountOrderUrl={storedSession.accountOrderUrl}
          />
        </div>
      </CheckoutLayout>
    )
  }

  return (
    <CheckoutLayout>
      <div className="mx-auto max-w-lg py-16 text-center">
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
