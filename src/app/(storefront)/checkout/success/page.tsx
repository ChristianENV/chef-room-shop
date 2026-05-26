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
  useOrderByNumberQuery,
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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { routes } from '@/src/config/routes'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import { useSession } from '@/src/lib/auth/auth-client'
import {
  Package,
  CreditCard,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'

const PAYMENT_LABELS: Record<string, string> = {
  CARD: 'Tarjeta',
  OXXO: 'OXXO',
  SPEI: 'SPEI',
  card: 'Tarjeta',
  oxxo: 'OXXO',
  spei: 'SPEI',
}

function resolvePaymentLabel(method: string | undefined): string {
  if (!method) return '—'
  return PAYMENT_LABELS[method] ?? method
}

function parseConfirmationEmail(raw: string | null): string {
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw) as CheckoutConfirmationSession
    return parsed.email?.trim() ?? ''
  } catch {
    return ''
  }
}

function OrderItemsList({ items }: { items: PublicOrder['items'] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => {
        const linePesos = centsToPesos(item.totalPriceCents + item.customizationPriceCents)
        const snapshot = item.productSnapshotJson as { name?: string; sizeName?: string } | null
        const name = snapshot?.name ?? 'Producto'
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
  customerEmail: string
  items?: PublicOrder['items']
  paymentReturnHint?: string | null
  isPolling?: boolean
  conektaEmail: string
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
  conektaEmail,
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
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Correo</dt>
          <dd className="font-sans font-medium text-foreground">{customerEmail}</dd>
        </div>
      </dl>

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

      {statusUi.canPay && (
        <CheckoutConektaPay
          orderNumber={orderNumber}
          email={conektaEmail}
          mode="prepare"
        />
      )}

      {statusUi.canRetryPayment && (
        <CheckoutConektaPay
          orderNumber={orderNumber}
          email={conektaEmail}
          mode="retry"
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
}

function SuccessPageActions({
  isAuthenticated,
  orderNumber,
  claimUrl,
  accountOrderUrl,
}: SuccessPageActionsProps) {
  const orderDetailHref =
    accountOrderUrl ??
    (isAuthenticated ? routes.accountOrderDetail(orderNumber) : null)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {orderDetailHref && (
        <Button asChild className="font-sans">
          <Link href={orderDetailHref}>Ver pedido</Link>
        </Button>
      )}
      {!isAuthenticated && claimUrl && (
        <Button asChild variant="default" className="font-sans">
          <Link href={claimUrl}>Crear cuenta para ver seguimiento</Link>
        </Button>
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
  const orderNumber = searchParams.get('orderNumber') ?? ''
  const paymentReturnHint = searchParams.get('payment')
  const { data: authSession } = useSession()

  const confirmationRaw = useSyncExternalStore(
    subscribeCheckoutConfirmation,
    readCheckoutConfirmationRaw,
    () => null,
  )

  const storedSession = useMemo((): CheckoutConfirmationSession | null => {
    if (!confirmationRaw) return null
    try {
      return JSON.parse(confirmationRaw) as CheckoutConfirmationSession
    } catch {
      return null
    }
  }, [confirmationRaw])

  const [email] = useState(() => parseConfirmationEmail(readCheckoutConfirmationRaw()))

  const {
    data: order,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useOrderByNumberQuery({
    orderNumber,
    email,
    enabled: orderNumber.length > 0 && email.length > 0,
    pollWhilePending: true,
  })

  const paymentReturnRefetchDone = useRef(false)
  useEffect(() => {
    if (!paymentReturnHint || paymentReturnRefetchDone.current) return
    if (!orderNumber || !email) return
    paymentReturnRefetchDone.current = true
    void refetch()
  }, [paymentReturnHint, orderNumber, email, refetch])

  const statusUi = useMemo(() => {
    if (order) {
      return getPaymentStatusUi({
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
      })
    }
    if (storedSession) {
      return getPaymentStatusUi({
        orderStatus: storedSession.status,
        paymentStatus: storedSession.paymentStatus,
      })
    }
    return getPaymentStatusUi({
      orderStatus: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
    })
  }, [order, storedSession])

  useEffect(() => {
    if (order?.status === 'PAID' || order?.paymentStatus === 'PAID') {
      clearCheckoutConfirmation()
    }
  }, [order?.status, order?.paymentStatus])

  const paymentMethodLabel = useMemo(() => {
    if (order?.payments[0]?.method) return resolvePaymentLabel(order.payments[0].method)
    return resolvePaymentLabel(storedSession?.paymentMethod)
  }, [order, storedSession])

  const isAuthenticated = Boolean(authSession?.user)
  const isPolling = isFetching && statusUi.shouldPoll

  if (!orderNumber) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-sans text-xl font-bold">Pedido no encontrado</h1>
          <p className="mt-2 font-serif text-muted-foreground">
            Falta el número de pedido. Revisa el enlace o contacta soporte.
          </p>
          <Button asChild className="mt-6 font-sans">
            <Link href={routes.shop}>Seguir comprando</Link>
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  if (!email) {
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

  if (isLoading && !order) {
    return <CheckoutSuccessLoading />
  }

  if (isError && !order) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-lg py-16 text-center">
          <Alert variant="destructive" className="text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-serif">
              No pudimos cargar tu pedido. Verifica tu conexión e intenta de nuevo.
            </AlertDescription>
          </Alert>
          <Button className="mt-6 font-sans" onClick={() => void refetch()}>
            Reintentar
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  if (order) {
    const totalPesos = centsToPesos(order.totalCents)

    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <OrderConfirmationCard
            orderNumber={order.orderNumber}
            statusUi={statusUi}
            totalPesos={totalPesos}
            paymentMethodLabel={paymentMethodLabel}
            customerEmail={order.customerEmail}
            items={order.items}
            paymentReturnHint={paymentReturnHint}
            isPolling={isPolling}
            conektaEmail={order.customerEmail}
          />
          <SuccessPageActions
            isAuthenticated={isAuthenticated}
            orderNumber={order.orderNumber}
            claimUrl={storedSession?.claimUrl}
            accountOrderUrl={storedSession?.accountOrderUrl}
          />
        </div>
      </CheckoutLayout>
    )
  }

  if (storedSession && storedSession.orderNumber === orderNumber) {
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
            paymentMethodLabel={resolvePaymentLabel(storedSession.paymentMethod)}
            customerEmail={storedSession.email}
            paymentReturnHint={paymentReturnHint}
            isPolling={isFetching && fallbackStatusUi.shouldPoll}
            conektaEmail={storedSession.email}
          />

          {isError && (
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
          pedido anterior necesitarás el correo usado en la compra.
        </p>
        <Button asChild className="mt-6 font-sans">
          <Link href={routes.shop}>Seguir comprando</Link>
        </Button>
      </div>
    </CheckoutLayout>
  )
}
