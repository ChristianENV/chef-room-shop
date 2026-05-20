'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

type AdminDashboardSectionSkeletonProps = {
  title?: string
  lines?: number
}

/**
 * Skeleton placeholder for a dashboard list section.
 */
export function AdminDashboardSectionSkeleton({
  title = 'Cargando…',
  lines = 4,
}: AdminDashboardSectionSkeletonProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-secondary" />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="sr-only">{title}</p>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary/80" />
        ))}
      </CardContent>
    </Card>
  )
}
