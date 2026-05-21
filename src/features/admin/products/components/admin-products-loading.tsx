'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function AdminProductsTableSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <div className="min-w-[900px] p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
