'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Info } from 'lucide-react'

import type { ShippingAddressData } from './shipping-address-form'

type SavedAddressSelectorProps = {
  address: ShippingAddressData
  onUseSaved: () => void
  onUseNew: () => void
  usingSaved: boolean
  className?: string
}

function formatAddressLine(data: ShippingAddressData): string {
  const parts = [
    data.street,
    data.exteriorNumber,
    data.neighborhood,
    data.city,
    data.state,
    data.postalCode,
  ].filter(Boolean)
  return parts.join(', ')
}

/**
 * Lets authenticated users pick a saved address or enter a new one for this order.
 */
export function SavedAddressSelector({
  address,
  onUseSaved,
  onUseNew,
  usingSaved,
  className,
}: SavedAddressSelectorProps) {
  const label = [address.firstName, address.lastName].filter(Boolean).join(' ')

  return (
    <div className={cn('space-y-3', className)}>
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="font-serif text-sm">
          Usaremos los datos guardados en tu cuenta. Puedes cambiarlos para esta compra.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="font-sans font-medium text-foreground">{label || 'Dirección guardada'}</p>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              {formatAddressLine(address)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={usingSaved ? 'default' : 'outline'}
          size="sm"
          className="font-sans"
          onClick={onUseSaved}
        >
          Usar esta dirección
        </Button>
        <Button
          type="button"
          variant={usingSaved ? 'outline' : 'default'}
          size="sm"
          className="font-sans"
          onClick={onUseNew}
        >
          Agregar nueva dirección
        </Button>
      </div>
    </div>
  )
}
