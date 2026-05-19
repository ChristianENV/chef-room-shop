'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'

// Loading Skeleton
export function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* Breadcrumbs */}
      <Skeleton className="mb-6 h-4 w-64" />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-md" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full" />
          
          {/* Colors */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-12 rounded-md" />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

// Product Not Found State
interface ProductNotFoundProps {
  className?: string
}

export function ProductNotFound({ className }: ProductNotFoundProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="rounded-full bg-secondary p-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="mt-6 font-sans text-2xl font-bold text-foreground">
        Producto no encontrado
      </h1>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        El producto que buscas no existe o ha sido removido de nuestro catalogo.
      </p>
      <div className="mt-6 flex gap-4">
        <Button asChild>
          <Link href="/shop">Ver catalogo</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}

// Error State with Retry
interface ProductErrorProps {
  onRetry: () => void
  className?: string
}

export function ProductError({ onRetry, className }: ProductErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="mt-6 font-sans text-2xl font-bold text-foreground">
        Error al cargar el producto
      </h1>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        Ocurrio un error al cargar la informacion del producto. Por favor intenta de nuevo.
      </p>
      <Button onClick={onRetry} className="mt-6">
        <RefreshCw className="mr-2 h-4 w-4" />
        Reintentar
      </Button>
    </div>
  )
}
