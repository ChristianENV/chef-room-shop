import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { routes } from '@/src/config/routes'
import type { CartPreviewCustomizationSummary } from '@/src/types/cart'

type CartCustomizationSummaryProps = {
  designId?: string
  summary?: CartPreviewCustomizationSummary
  showEditLink?: boolean
  className?: string
}

/**
 * Displays customization details for a cart line item (logo, bordado, áreas, design id).
 */
export function CartCustomizationSummary({
  designId,
  summary,
  showEditLink = true,
  className,
}: CartCustomizationSummaryProps) {
  if (!summary && !designId) return null

  return (
    <div className={className} data-testid="cart-customization-summary">
      <p className="mb-2 flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        Personalización
      </p>
      {designId && (
        <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          {designId}
        </p>
      )}
      {summary && (
        <ul className="mt-1 space-y-0.5 font-serif text-xs text-muted-foreground">
          {summary.personalizationLine ? (
            <li data-testid="cart-item-customization-summary">
              Personalización: {summary.personalizationLine}
            </li>
          ) : null}
          {summary.hasLogo && <li>Logo incluido</li>}
          {summary.hasEmbroidery && <li>Bordado</li>}
          {summary.embroideredName && (
            <li>&quot;{summary.embroideredName}&quot;</li>
          )}
          {summary.areas && summary.areas.length > 0 && (
            <li>Áreas: {summary.areas.join(', ')}</li>
          )}
          {summary.lines && summary.lines.length > 0 && (
            <li>Texto: {summary.lines.join(' · ')}</li>
          )}
        </ul>
      )}
      {showEditLink && (
        <Link
          href={routes.customize}
          className="mt-2 inline-block font-sans text-xs font-medium text-primary hover:underline"
        >
          Editar diseño
        </Link>
      )}
    </div>
  )
}
