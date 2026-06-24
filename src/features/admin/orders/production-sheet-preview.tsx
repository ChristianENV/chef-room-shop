'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Printer, Palette } from 'lucide-react'

import { CustomizationSnapshot } from './customization-snapshot'
import { AdminOrdersError } from './components/admin-orders-error'
import type { AdminOrdersProductionSheetUi } from './types/admin-orders-ui.types'

interface ProductionSheetPreviewProps {
  sheet: AdminOrdersProductionSheetUi | undefined
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  onPrint?: () => void
}

export function ProductionSheetPreview({
  sheet,
  isLoading,
  isError,
  onRetry,
  onPrint,
}: ProductionSheetPreviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <AdminOrdersError
        compact
        message="No pudimos cargar la ficha de producción."
        onRetry={onRetry}
      />
    )
  }

  if (!sheet) return null

  return (
    <Card className="border-2 border-dashed border-border bg-card print:border-solid print:border-black">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="font-sans text-lg">Ficha de producción</CardTitle>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{sheet.orderNumber}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint ?? (() => window.print())}
          className="print:hidden"
        >
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-secondary p-4">
          <div>
            <p className="font-serif text-xs text-muted-foreground">Generada</p>
            <p className="font-sans font-medium text-foreground">{sheet.generatedAtFormatted}</p>
          </div>
          <div>
            <p className="font-serif text-xs text-muted-foreground">Cliente</p>
            <p className="font-sans font-medium text-foreground">{sheet.customerName}</p>
            <p className="font-serif text-xs text-muted-foreground">{sheet.customerEmail}</p>
          </div>
        </div>

        {sheet.notes ? (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <p className="font-sans text-sm font-semibold text-warning">Notas del pedido</p>
            <p className="mt-1 whitespace-pre-wrap font-serif text-sm text-foreground">
              {sheet.notes}
            </p>
          </div>
        ) : null}

        <Separator />

        {sheet.items.map((item) => (
          <div key={item.id} className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-sans text-lg font-semibold text-foreground">
                  {item.productName}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{item.sku}</Badge>
                  <Badge variant="secondary">Talla: {item.size}</Badge>
                  <Badge variant="secondary">Cant: {item.quantity}</Badge>
                  {item.hasCustomization ? (
                    <Badge className="gap-1">
                      <Palette className="h-3 w-3" />
                      Personalizado
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
            {item.hasCustomization ? <CustomizationSnapshot item={item} /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
