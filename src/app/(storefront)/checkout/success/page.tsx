'use client'

import { Suspense, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import {
  useOrderByNumberQuery,
  type PublicOrder,
} from '@/src/features/storefront/checkout'
import {
  readCheckoutConfirmation,
  clearCheckoutConfirmation,
  type CheckoutConfirmationSession,
} from '@/src/features/storefront/checkout/lib/checkout-session'
import { CheckoutConektaPay } from '@/src/features/storefront/checkout/checkout-conekta-pay'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { routes } from '@/src/config/routes'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import { useSession } from '@/src/lib/auth/auth-client'
import {
  CheckCircle2,
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

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PENDING: 'Pendiente de pago',
}

function resolvePaymentLabel(method: string | undefined): string {
  if (!method) return '—'
  return PAYMENT_LABELS[method] ?? method
}

function OrderItemsList({ order }: { order: PublicOrder }) {
  return (
    <ul className="mt-4 space-y-3">
      {order.items.map((item) => {
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

function SessionFallbackSummary({ session }: { session: CheckoutConfirmationSession }) {
  const totalPesos = centsToPesos(session.totalCents)

  return (
    <div className="rounded-lg border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">Pedido creado</h1>
          <p className="font-serif text-muted-foreground">
            Número de pedido:{' '}
            <span className="font-sans font-semibold text-foreground">{session.orderNumber}</span>
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <dl className="grid gap-3 font-serif text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Estado</dt>
          <dd className="font-sans font-medium text-foreground">
            {STATUS_LABELS[session.status] ?? session.status}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="font-sans text-lg font-bold text-foreground">
            {formatCurrencyMXN(totalPesos)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Método de pago</dt>
          <dd className="font-sans font-medium text-foreground">
            {resolvePaymentLabel(session.paymentMethod)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Correo</dt>
          <dd className="font-sans font-medium text-foreground">{session.email}</dd>
        </div>
      </dl>

      <CheckoutConektaPay
        orderNumber={session.orderNumber}
        email={session.email}
        disabled={session.status !== 'PENDING_PAYMENT'}
      />
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
  const { data: authSession } = useSession()

  const storedSession = useSyncExternalStore(
    () => () => {},
    () => readCheckoutConfirmation(),
    () => null as CheckoutConfirmationSession | null,
  )

  const [guestEmail] = useState(() => readCheckoutConfirmation()?.email ?? '')
  const email = guestEmail || storedSession?.email || ''

  const {
    data: order,
    isLoading,
    isError,
  } = useOrderByNumberQuery({
    orderNumber,
    email,
    enabled: orderNumber.length > 0 && email.length > 0,
  })

  useEffect(() => {
    if (order) clearCheckoutConfirmation()
  }, [order])

  const paymentMethodLabel = useMemo(() => {
    if (order?.payments[0]?.method) return resolvePaymentLabel(order.payments[0].method)
    return resolvePaymentLabel(storedSession?.paymentMethod)
  }, [order, storedSession])

  const isAuthenticated = Boolean(authSession?.user)

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

  if (email && isLoading) {
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

  if (order) {
    const totalPesos = centsToPesos(order.totalCents)

    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <div>
                <h1 className="font-sans text-2xl font-bold text-foreground">Pedido creado</h1>
                <p className="font-serif text-muted-foreground">
                  Número de pedido:{' '}
                  <span className="font-sans font-semibold text-foreground">
                    {order.orderNumber}
                  </span>
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <dl className="grid gap-3 font-serif text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Estado</dt>
                <dd className="font-sans font-medium text-foreground">
                  {STATUS_LABELS[order.status] ?? order.status}
                </dd>
              </div>
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
              <div>
                <dt className="text-muted-foreground">Correo</dt>
                <dd className="font-sans font-medium text-foreground">{order.customerEmail}</dd>
              </div>
            </dl>

            <Separator className="my-6" />

            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-sans text-lg font-semibold">Artículos</h2>
            </div>
            <OrderItemsList order={order} />

            {order.status === 'PENDING_PAYMENT' && (
              <CheckoutConektaPay
                orderNumber={order.orderNumber}
                email={order.customerEmail}
              />
            )}

            {order.status !== 'PENDING_PAYMENT' && (
              <Alert className="mt-6 border-success/30 bg-success/5">
                <AlertCircle className="h-4 w-4 text-success" />
                <AlertDescription className="font-serif text-sm">
                  El estado de tu pago se actualizará automáticamente cuando Conekta confirme el
                  cobro.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isAuthenticated && (
              <Button asChild variant="outline" className="font-sans">
                <Link href={routes.account}>Ir a mi cuenta</Link>
              </Button>
            )}
            <Button asChild className="font-sans">
              <Link href={routes.shop}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Seguir comprando
              </Link>
            </Button>
          </div>
        </div>
      </CheckoutLayout>
    )
  }

  if (storedSession && storedSession.orderNumber === orderNumber) {
    return (
      <CheckoutLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <SessionFallbackSummary session={storedSession} />

          <div className="flex flex-col gap-3 sm:flex-row">
            {isAuthenticated && (
              <Button asChild variant="outline" className="font-sans">
                <Link href={routes.account}>Ir a mi cuenta</Link>
              </Button>
            )}
            <Button asChild className="font-sans">
              <Link href={routes.shop}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Seguir comprando
              </Link>
            </Button>
          </div>

          {isError && (
            <Alert>
              <AlertDescription className="font-serif text-sm text-muted-foreground">
                No pudimos cargar el detalle completo del pedido. Los datos mostrados provienen de
                tu confirmación reciente.
              </AlertDescription>
            </Alert>
          )}
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
          pedido anterior necesitarás el correo usado en la compra (token público pendiente).
        </p>
        <Button asChild className="mt-6 font-sans">
          <Link href={routes.shop}>Seguir comprando</Link>
        </Button>
      </div>
    </CheckoutLayout>
  )
}



