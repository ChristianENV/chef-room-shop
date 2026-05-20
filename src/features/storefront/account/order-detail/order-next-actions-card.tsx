import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import type { AccountOrder } from '../types'

type OrderNextActionsCardProps = {
  order: AccountOrder
}

function getActionContent(order: AccountOrder): {
  title: string
  description: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
} {
  const status = order.status.toUpperCase()
  const tracking = order.shipments[0]?.trackingNumber

  switch (status) {
    case 'PENDING_PAYMENT':
    case 'PAYMENT_FAILED':
      return {
        title: 'Completa tu pago',
        description: 'La producción inicia cuando se confirme el pago.',
        primaryLabel: 'Completar pago',
      }
    case 'PAID':
      return {
        title: 'Pedido confirmado',
        description: 'Tu pedido pasará a producción.',
      }
    case 'IN_PRODUCTION':
    case 'READY_TO_SHIP':
      return {
        title: 'En producción',
        description: 'Estamos trabajando en tus prendas personalizadas.',
      }
    case 'SHIPPED':
      return {
        title: 'En camino',
        description: 'Tu pedido va en camino.',
        ...(tracking
          ? {
              primaryHref: `${routes.contact}?order=${encodeURIComponent(order.orderNumber)}`,
              primaryLabel: 'Consultar envío',
            }
          : {}),
      }
    case 'DELIVERED':
      return {
        title: '¡Gracias por tu compra!',
        description: 'Gracias por confiar en Chef Room.',
        primaryHref: routes.shop,
        primaryLabel: 'Comprar de nuevo',
      }
    case 'CANCELLED':
    case 'REFUNDED':
      return {
        title: 'Pedido cancelado',
        description: 'Si necesitas ayuda, nuestro equipo puede orientarte.',
        primaryHref: routes.contact,
        primaryLabel: 'Contactar soporte',
        secondaryHref: routes.shop,
        secondaryLabel: 'Volver a tienda',
      }
    default:
      return {
        title: 'Seguimiento',
        description: 'Te avisaremos cuando haya novedades.',
      }
  }
}

/**
 * Contextual next-step guidance and CTAs.
 */
export function OrderNextActionsCard({ order }: OrderNextActionsCardProps) {
  const content = getActionContent(order)
  const showPayHint =
    order.status.toUpperCase() === 'PENDING_PAYMENT' ||
    order.status.toUpperCase() === 'PAYMENT_FAILED'

  return (
    <section
      className="rounded-xl border border-primary/20 bg-primary/5 p-6"
      aria-labelledby="order-actions-title"
    >
      <h2 id="order-actions-title" className="font-sans text-lg font-semibold text-foreground">
        {content.title}
      </h2>
      <p className="mt-2 font-serif text-sm text-muted-foreground">{content.description}</p>

      <div className="mt-4 flex flex-col gap-2">
        {content.primaryHref && content.primaryLabel && (
          <Button asChild className="font-sans">
            <Link href={content.primaryHref}>
              {content.primaryLabel === 'Comprar de nuevo' && (
                <ShoppingBag className="mr-2 h-4 w-4" />
              )}
              {content.primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        {showPayHint && (
          <p className="font-serif text-xs text-muted-foreground">
            Usa la sección de pago para iniciar o reintentar con Conekta.
          </p>
        )}
        {content.secondaryHref && content.secondaryLabel && (
          <Button asChild variant="outline" className="font-sans">
            <Link href={content.secondaryHref}>{content.secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  )
}
