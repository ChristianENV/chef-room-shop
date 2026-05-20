'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AccountLayout } from '@/src/features/storefront/layout/account-layout'
import { AccountQueryError } from '@/src/features/storefront/account/components/account-query-error'
import { useAccountAuthRedirect } from '@/src/features/storefront/account/api/use-account-auth-redirect'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { useMyOrderByNumberQuery } from '@/src/features/storefront/account/api/use-my-order-by-number-query'
import { getAccountUserErrorMessage } from '@/src/features/storefront/account/api/account-errors'
import { mapAccountUserToProfile } from '@/src/features/storefront/account/mappers/account-ui.mapper'
import { routes } from '@/src/config/routes'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAYMENT_FAILED: 'Pago fallido',
  PAID: 'Pagado',
  IN_PRODUCTION: 'En producción',
  READY_TO_SHIP: 'Listo para envío',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  PARTIALLY_REFUNDED: 'Reembolso parcial',
}

export default function AccountOrderDetailPage() {
  const params = useParams()
  const orderNumber = typeof params.orderNumber === 'string' ? params.orderNumber : ''

  const profileQuery = useMeProfileQuery()
  const orderQuery = useMyOrderByNumberQuery({ orderNumber })

  const isError = profileQuery.isError || orderQuery.isError
  const error = profileQuery.error ?? orderQuery.error
  useAccountAuthRedirect(isError, error)

  const userName = useMemo(() => {
    if (profileQuery.data) {
      return mapAccountUserToProfile(profileQuery.data).firstName
    }
    return 'Cliente'
  }, [profileQuery.data])

  if (orderQuery.isLoading) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <p className="font-serif text-muted-foreground">Cargando pedido...</p>
      </AccountLayout>
    )
  }

  if (orderQuery.isError) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <AccountQueryError
          message={getAccountUserErrorMessage(
            error,
            'No pudimos cargar tu pedido. Intenta de nuevo.',
          )}
          onRetry={() => void orderQuery.refetch()}
        />
      </AccountLayout>
    )
  }

  const order = orderQuery.data

  if (!order) {
    return (
      <AccountLayout title="Detalle del pedido" userName={userName}>
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-sans text-lg font-semibold">Pedido no encontrado</h2>
            <p className="mt-2 font-serif text-muted-foreground">
              Verifica el número de pedido o revisa tu historial.
            </p>
            <Button asChild className="mt-6 font-sans">
              <Link href={routes.account}>Volver a mis pedidos</Link>
            </Button>
          </CardContent>
        </Card>
      </AccountLayout>
    )
  }

  const totalPesos = centsToPesos(order.totalCents)

  return (
    <AccountLayout
      title={`Pedido ${order.orderNumber}`}
      description="Estado, pagos y seguimiento"
      userName={userName}
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 font-sans">
        <Link href={`${routes.account}/orders`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Mis pedidos
        </Link>
      </Button>

      <Card className="border-border bg-card">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-sans text-lg font-semibold text-foreground">
              {order.orderNumber}
            </h2>
            <Badge variant="outline">{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
            <Badge variant="secondary">
              Pago: {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </Badge>
            <Badge variant="secondary">Envío: {order.fulfillmentStatus}</Badge>
          </div>

          <p className="font-sans text-2xl font-bold text-foreground">
            {formatCurrencyMXN(totalPesos)}
          </p>

          <Separator />

          <section>
            <h3 className="font-sans text-sm font-semibold text-foreground">Productos</h3>
            <ul className="mt-3 space-y-3">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4 font-serif text-sm"
                >
                  <div>
                    <p className="font-sans font-medium text-foreground">{item.name}</p>
                    <p className="text-muted-foreground">
                      Cantidad: {item.quantity}
                      {item.sku ? ` · SKU ${item.sku}` : ''}
                    </p>
                  </div>
                  <span className="font-sans font-medium">
                    {formatCurrencyMXN(centsToPesos(item.totalPriceCents))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {order.payments && order.payments.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="font-sans text-sm font-semibold text-foreground">Pagos</h3>
                <ul className="mt-3 space-y-2 font-serif text-sm text-muted-foreground">
                  {order.payments.map((payment, index) => (
                    <li key={`${payment.method}-${index}`}>
                      {payment.method ?? '—'} · {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}{' '}
                      · {formatCurrencyMXN(centsToPesos(payment.amountCents))}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {order.shipments && order.shipments.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="font-sans text-sm font-semibold text-foreground">Envíos</h3>
                <ul className="mt-3 space-y-2 font-serif text-sm text-muted-foreground">
                  {order.shipments.map((shipment, index) => (
                    <li key={`${shipment.trackingNumber ?? index}`}>
                      {shipment.carrier ?? 'Transportista'} · {shipment.status}
                      {shipment.trackingNumber
                        ? ` · Guía ${shipment.trackingNumber}`
                        : ''}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {order.events && order.events.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="font-sans text-sm font-semibold text-foreground">Historial</h3>
                <ul className="mt-3 space-y-2 font-serif text-sm text-muted-foreground">
                  {order.events.map((event, index) => (
                    <li key={`${event.createdAt}-${index}`}>
                      {new Date(event.createdAt).toLocaleString('es-MX')} —{' '}
                      {event.message ?? event.type}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </AccountLayout>
  )
}
