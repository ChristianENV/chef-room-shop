import Link from 'next/link'
import { HelpCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

type OrderSupportCardProps = {
  orderNumber: string
}

/**
 * Support contact card for order-related help.
 */
export function OrderSupportCard({ orderNumber }: OrderSupportCardProps) {
  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="order-support-title"
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-muted-foreground" aria-hidden />
        <h2 id="order-support-title" className="font-sans text-lg font-semibold text-foreground">
          Soporte
        </h2>
      </div>
      <p className="mt-3 font-serif text-sm text-muted-foreground">
        ¿Necesitas ayuda con el pedido <span className="font-sans font-medium">{orderNumber}</span>?
        Nuestro equipo puede orientarte sobre pago, producción o envío.
      </p>
      <Button asChild variant="outline" className="mt-4 w-full font-sans sm:w-auto">
        <Link href={`${routes.contact}?order=${encodeURIComponent(orderNumber)}`}>
          Contactar soporte
        </Link>
      </Button>
    </section>
  )
}
