import { Skeleton } from '@/components/ui/skeleton'

export function AdminColorsTableSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}
