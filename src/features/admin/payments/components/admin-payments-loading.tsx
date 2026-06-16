'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function AdminPaymentsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="min-w-[1100px]">
        <div className="grid grid-cols-9 gap-4 border-b border-border px-4 py-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-9 gap-4 border-b border-border px-4 py-4 last:border-0"
          >
            {Array.from({ length: 9 }).map((_, col) => (
              <Skeleton key={col} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
