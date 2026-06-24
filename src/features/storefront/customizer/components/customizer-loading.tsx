'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function CustomizerLoading() {
  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-background"
      data-testid="customizer-loading"
    >
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-80 border-r border-border/30 p-4 md:block">
          <Skeleton className="mb-4 h-10 w-full" />
          <Skeleton className="mb-3 h-6 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="size-8 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12]">
          <p className="font-sans text-sm text-muted-foreground">Preparando tu customizador…</p>
        </div>
      </div>
    </div>
  )
}
