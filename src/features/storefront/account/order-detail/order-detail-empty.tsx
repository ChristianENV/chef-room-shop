import Link from 'next/link'
import { Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { routes } from '@/src/config/routes'

/**
 * Empty state when order is not found for the current user.
 */
export function OrderDetailEmpty() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <Package className="h-10 w-10 text-muted-foreground" aria-hidden />
        <h2 className="mt-4 font-sans text-lg font-semibold text-foreground">
          No encontramos este pedido en tu cuenta
        </h2>
        <p className="mt-2 max-w-sm font-serif text-sm text-muted-foreground">
          Verifica el número de pedido o revisa tu historial de compras.
        </p>
        <Button asChild className="mt-6 font-sans">
          <Link href={`${routes.account}/orders`}>Volver a mis pedidos</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
