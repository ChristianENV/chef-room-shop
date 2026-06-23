'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface StickyBuyBarProps {
  price: number
  onCustomize: () => void
  className?: string
}

export function StickyBuyBar({ price, onCustomize, className }: StickyBuyBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 md:hidden',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-serif text-xs text-muted-foreground">Precio base</p>
          <p className="font-sans text-xl font-bold text-foreground">
            ${price.toLocaleString('es-MX')}
          </p>
        </div>
        <Button size="lg" onClick={onCustomize} className="flex-1 font-sans">
          Personalizar
        </Button>
      </div>
    </div>
  )
}
