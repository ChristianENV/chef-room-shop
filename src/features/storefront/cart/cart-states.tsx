'use client'
import { routes } from '@/src/config/routes'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingBag, Palette, AlertCircle, RefreshCw } from 'lucide-react'

// Empty Cart State
interface EmptyCartStateProps {
  className?: string
}

export function EmptyCartState({ className }: EmptyCartStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-6 rounded-full bg-secondary p-6">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="font-sans text-2xl font-bold text-foreground">Tu carrito está vacío</h2>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        Explora la tienda o diseña tu uniforme personalizado.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="font-sans">
          <Link href={routes.shop}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Explorar catálogo
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="font-sans">
          <Link href={routes.customize}>
            <Palette className="mr-2 h-4 w-4" />
            Diseñar uniforme
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Cart Skeleton
interface CartSkeletonProps {
  itemCount?: number
  className?: string
}

export function CartSkeleton({ itemCount = 2, className }: CartSkeletonProps) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-3', className)}>
      {/* Items Column */}
      <div className="space-y-4 lg:col-span-2">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Image Skeleton */}
              <Skeleton className="h-32 w-32 flex-shrink-0 rounded-lg sm:h-36 sm:w-36" />

              {/* Content Skeleton */}
              <div className="flex flex-1 flex-col">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-6 w-48" />
                <Skeleton className="mt-3 h-4 w-32" />
                <Skeleton className="mt-3 h-16 w-full rounded-lg" />
                <div className="mt-auto flex items-end justify-between pt-4">
                  <Skeleton className="h-8 w-28" />
                  <div className="space-y-1 text-right">
                    <Skeleton className="ml-auto h-3 w-24" />
                    <Skeleton className="ml-auto h-7 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Column */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border border-border bg-card p-6">
          <Skeleton className="h-6 w-40" />
          <div className="mt-6 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <Skeleton className="my-4 h-px w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="my-4 h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="mt-6 h-12 w-full" />
          <Skeleton className="mx-auto mt-4 h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

// Cart Error State
interface CartErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function CartErrorState({
  message = 'No pudimos cargar tu carrito. Por favor intenta de nuevo.',
  onRetry,
  className,
}: CartErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="font-sans text-xl font-bold text-foreground">Error al cargar el carrito</h2>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Intentar de nuevo
        </Button>
      )}
    </div>
  )
}

// Sticky Mobile Checkout Bar
interface StickyCheckoutBarProps {
  total: number
  itemCount: number
  className?: string
}

export function StickyCheckoutBar({ total, itemCount, className }: StickyCheckoutBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4 shadow-lg lg:hidden',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-serif text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
          </p>
          <p className="font-sans text-xl font-bold text-foreground">{formatCurrencyMXN(total)}</p>
        </div>
        <Button asChild size="lg" className="font-sans font-semibold">
          <Link href={routes.checkout}>Continuar</Link>
        </Button>
      </div>
    </div>
  )
}
