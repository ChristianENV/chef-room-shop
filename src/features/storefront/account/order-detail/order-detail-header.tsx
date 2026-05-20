import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { routes } from '@/src/config/routes'

type OrderDetailHeaderProps = {
  orderNumber: string
}

/**
 * Breadcrumb navigation for order detail.
 */
export function OrderDetailHeader({ orderNumber }: OrderDetailHeaderProps) {
  return (
    <nav
      aria-label="Ruta del pedido"
      className="mb-6 flex flex-wrap items-center gap-1 font-serif text-sm text-muted-foreground"
    >
      <Link href={routes.account} className="transition-colors hover:text-primary">
        Mi cuenta
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <Link
        href={`${routes.account}/orders`}
        className="transition-colors hover:text-primary"
      >
        Mis pedidos
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="font-sans font-medium text-foreground">{orderNumber}</span>
    </nav>
  )
}
