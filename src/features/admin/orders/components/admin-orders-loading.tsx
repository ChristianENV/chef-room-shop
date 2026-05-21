'use client'

import { Skeleton } from '@/components/ui/skeleton'

type AdminOrdersTableSkeletonProps = {
  rows?: number
}

/**
 * Skeleton for the admin orders table.
 */
export function AdminOrdersTableSkeleton({ rows = 6 }: AdminOrdersTableSkeletonProps) {
  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-10 gap-4 border-b border-border px-4 py-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-10 gap-4 border-b border-border px-4 py-4 last:border-0"
          >
            {Array.from({ length: 10 }).map((_, col) => (
              <Skeleton key={col} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for status summary cards.
 */
export function AdminOrdersStatusCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-[88px] w-full rounded-lg" />
      ))}
    </div>
  )
}

/**
 * Skeleton for order detail drawer header and body.
 */
export function AdminOrderDetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  )
}
