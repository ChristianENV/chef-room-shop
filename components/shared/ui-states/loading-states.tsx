'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

const TABLE_SKELETON_WIDTHS = [64, 80, 72, 96, 56, 88, 76, 68] as const

// Product Card Skeleton
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden border-border bg-card', className)}>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <CardContent className="p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-5 w-3/4" />
        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-6 w-24" />
      </CardContent>
    </Card>
  )
}

// Product Grid Skeleton
interface ProductGridSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
  className?: string
}

export function ProductGridSkeleton({ 
  count = 8, 
  columns = 4,
  className 
}: ProductGridSkeletonProps) {
  const colsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-6', colsClass[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Product Detail Skeleton
export function ProductDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-2', className)}>
      {/* Gallery */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Info */}
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-3/4" />
          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        <Skeleton className="h-8 w-32" />
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        
        {/* Colors */}
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
        
        {/* Sizes */}
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-12 rounded-md" />
            ))}
          </div>
        </div>
        
        {/* CTAs */}
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-md" />
          <Skeleton className="h-12 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  )
}

// Cart Skeleton
export function CartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-3', className)}>
      {/* Items */}
      <div className="space-y-4 lg:col-span-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="flex gap-4 p-4">
              <Skeleton className="h-24 w-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Summary */}
      <Card className="h-fit border-border bg-card">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  )
}

// Checkout Skeleton
export function CheckoutSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-5', className)}>
      {/* Form */}
      <div className="space-y-6 lg:col-span-3">
        {/* Steps */}
        <div className="flex items-center gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="hidden h-4 w-20 sm:block" />
            </div>
          ))}
        </div>
        
        {/* Contact */}
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
        
        {/* Address */}
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Summary */}
      <div className="lg:col-span-2">
        <Card className="sticky top-4 border-border bg-card">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Customizer Skeleton
export function CustomizerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-3', className)}>
      {/* Canvas Area */}
      <div className="lg:col-span-2">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="mt-4 flex justify-center gap-2">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls Panel */}
      <div className="space-y-4">
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-4">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-4">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardContent className="space-y-4 p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </CardContent>
        </Card>
        
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  )
}

// Admin Table Skeleton
interface AdminTableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function AdminTableSkeleton({ 
  rows = 5, 
  columns = 6,
  className 
}: AdminTableSkeletonProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <div className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-3">
          <Skeleton className="h-4 w-4" />
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-4" 
              style={{ width: `${TABLE_SKELETON_WIDTHS[i % TABLE_SKELETON_WIDTHS.length]}px` }}
            />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-10 w-10 rounded-md" />
            {Array.from({ length: columns - 1 }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className="h-4" 
                style={{ width: `${TABLE_SKELETON_WIDTHS[(rowIndex + colIndex) % TABLE_SKELETON_WIDTHS.length]}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}

// Dashboard Metric Skeleton
export function DashboardMetricSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// Dashboard Metrics Grid Skeleton
export function DashboardMetricsGridSkeleton({ 
  count = 4,
  className 
}: { 
  count?: number
  className?: string 
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <DashboardMetricSkeleton key={i} />
      ))}
    </div>
  )
}
