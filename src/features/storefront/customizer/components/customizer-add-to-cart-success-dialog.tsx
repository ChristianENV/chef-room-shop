'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface CustomizerAddToCartSuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName?: string
  previewUrl?: string | null
  onContinueDesigning: () => void
  cartHref: string
}

export function CustomizerAddToCartSuccessDialog({
  open,
  onOpenChange,
  productName,
  previewUrl,
  onContinueDesigning,
  cartHref,
}: CustomizerAddToCartSuccessDialogProps) {
  const goToCartRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => {
      goToCartRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onContinueDesigning()
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-testid="customizer-add-to-cart-success-dialog"
        className={cn(
          'gap-0 overflow-hidden border-border bg-card p-0 text-card-foreground shadow-lg sm:max-w-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          goToCartRef.current?.focus()
        }}
      >
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center px-6 pb-6 pt-8 text-center"
        >
          <div
            className={cn(
              'mb-4 flex size-14 items-center justify-center rounded-full',
              'bg-primary/10 ring-1 ring-primary/20',
              'animate-in zoom-in-95 fade-in duration-300',
            )}
          >
            <CheckCircle2
              className="size-8 text-primary animate-in zoom-in-50 duration-500"
              aria-hidden
            />
          </div>

          <DialogHeader className="items-center space-y-2 text-center">
            <DialogTitle className="font-sans text-xl font-semibold tracking-tight">
              Tu diseño está en el carrito
            </DialogTitle>
            <DialogDescription className="max-w-sm font-serif text-sm leading-relaxed">
              Guardamos tu personalización y agregamos la prenda al carrito. Puedes revisar tu
              pedido o seguir diseñando.
            </DialogDescription>
          </DialogHeader>

          <ul className="mt-4 flex w-full flex-col gap-2 text-left text-xs text-muted-foreground">
            {[
              'Diseño guardado',
              'Prenda agregada al carrito',
              'Tu diseño está listo para comprar',
            ].map((label) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 ring-1 ring-border"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          {productName ? (
            <p className="mt-3 text-xs font-medium text-foreground">{productName}</p>
          ) : null}

          {previewUrl ? (
            <div className="mt-4 w-full overflow-hidden rounded-lg border border-border bg-muted p-2 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview URL from R2/CDN */}
              <img
                src={previewUrl}
                alt="Vista previa de tu diseño personalizado"
                className="mx-auto max-h-36 w-full object-contain"
              />
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 border-t border-border bg-muted/50 px-6 py-4 sm:flex-col">
          <Button asChild className="w-full font-sans" data-testid="customizer-go-to-cart-button">
            <Link href={cartHref} ref={goToCartRef}>
              Ir al carrito
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full font-sans"
            data-testid="customizer-continue-designing-button"
            onClick={() => handleOpenChange(false)}
          >
            Seguir diseñando
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
