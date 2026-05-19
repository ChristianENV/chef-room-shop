import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw, Package, Search, ShoppingCart } from 'lucide-react'
import type { ReactNode } from 'react'

// Status Badge Component
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info'
  text: string
  className?: string
}

const statusConfig = {
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  error: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    dot: 'bg-destructive',
  },
  info: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    dot: 'bg-accent',
  },
}

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full px-3 py-1',
      config.bg,
      className
    )}>
      <div className={cn('h-2 w-2 rounded-full', config.dot)} />
      <span className={cn('font-sans text-sm font-medium', config.text)}>
        {text}
      </span>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'search' | 'cart'
  className?: string
}

const emptyStateIcons = {
  default: Package,
  search: Search,
  cart: ShoppingCart,
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  variant = 'default',
  className 
}: EmptyStateProps) {
  const IconComponent = emptyStateIcons[variant]
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-secondary p-4">
        {icon || <IconComponent className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-1 max-w-sm font-serif text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Error State Component
interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
  className?: string
}

export function ErrorState({ 
  title = 'Algo salió mal', 
  message, 
  retry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-1 max-w-sm font-serif text-muted-foreground">
        {message}
      </p>
      {retry && (
        <Button onClick={retry} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Intentar de nuevo
        </Button>
      )}
    </div>
  )
}

// Loading Skeleton Component
interface LoadingSkeletonProps {
  variant?: 'product-card' | 'text' | 'hero' | 'list-item'
  count?: number
  className?: string
}

export function LoadingSkeleton({ 
  variant = 'product-card', 
  count = 1,
  className 
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (variant === 'product-card') {
    return (
      <div className={cn('grid gap-6', className)}>
        {items.map((i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-20" />
              <Skeleton className="mt-3 h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {items.map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-4 h-10 w-32" />
      </div>
    )
  }

  if (variant === 'list-item') {
    return (
      <div className={cn('space-y-3', className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
