import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { routes } from '@/src/config/routes'

type OrderDetailErrorProps = {
  onRetry?: () => void
}

/**
 * Error state when order detail fails to load.
 */
export function OrderDetailError({ onRetry }: OrderDetailErrorProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <h2 className="font-sans text-lg font-semibold text-foreground">
          No pudimos cargar el detalle de tu pedido
        </h2>
        <p className="mt-2 max-w-sm font-serif text-sm text-muted-foreground">
          Verifica tu conexión e intenta de nuevo.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {onRetry && (
            <Button variant="default" className="gap-2 font-sans" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2 font-sans">
            <Link href={`${routes.account}/orders`}>
              <ArrowLeft className="h-4 w-4" />
              Volver a mis pedidos
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
