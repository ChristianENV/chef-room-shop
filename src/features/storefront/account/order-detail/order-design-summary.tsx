import Image from 'next/image'
import { Palette } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DesignSnapshot } from './order-detail.utils'

type OrderDesignSummaryProps = {
  design: DesignSnapshot
}

/**
 * Compact customization summary for an order line item.
 */
export function OrderDesignSummary({ design }: OrderDesignSummaryProps) {
  const details: string[] = []
  if (design.hasLogo) details.push('Logo incluido')
  if (design.hasEmbroidery) details.push('Bordado')
  if (design.embroideredName) details.push(`Nombre: ${design.embroideredName}`)
  if (design.areas?.length) details.push(`Áreas: ${design.areas.join(', ')}`)
  if (design.summary?.length) details.push(...design.summary)

  return (
    <div className="mt-3 rounded-lg border border-primary/15 bg-primary/5 p-3">
      <div className="flex flex-wrap items-start gap-3">
        {design.previewUrl ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
            <Image
              src={design.previewUrl}
              alt="Vista previa del diseño"
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
            <Palette className="h-6 w-6 text-primary/60" aria-hidden />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <Badge
            variant="outline"
            className="border-primary/30 font-sans text-xs text-primary"
          >
            Personalizado
          </Badge>
          {details.length > 0 ? (
            <ul className="space-y-0.5 font-serif text-xs text-muted-foreground">
              {details.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className="font-serif text-xs text-muted-foreground">
              Incluye personalización Chef Room
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 font-sans text-xs"
            disabled
            title="Próximamente"
          >
            Ver diseño (próximamente)
          </Button>
        </div>
      </div>
    </div>
  )
}
