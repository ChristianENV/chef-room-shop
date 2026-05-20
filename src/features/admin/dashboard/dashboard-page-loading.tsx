import { AdminDashboardMetricsSkeleton } from '@/src/features/admin/dashboard/components/admin-dashboard-metrics-skeleton'

/**
 * Server-safe loading fallback for the admin dashboard route.
 */
export function DashboardPageLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-secondary" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AdminDashboardMetricsSkeleton />
      </div>
    </div>
  )
}
