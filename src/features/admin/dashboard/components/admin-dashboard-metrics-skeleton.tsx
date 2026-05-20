'use client'

import { Card, CardContent } from '@/components/ui/card'

/**
 * Skeleton placeholder for the six KPI metric cards.
 */
export function AdminDashboardMetricsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border-border bg-card">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-24 rounded bg-secondary" />
              <div className="h-8 w-32 rounded bg-secondary" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
