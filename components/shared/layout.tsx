import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

// Re-export brand containers for convenience
export { BrandContainer, SectionHeader, PageHeader } from '@/components/brand/containers'

interface ResponsiveShellProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: '',
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
}

export function ResponsiveShell({
  children,
  maxWidth = '7xl',
  padding = 'md',
  className,
}: ResponsiveShellProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface SimpleBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function SimpleBreadcrumb({ items, className }: SimpleBreadcrumbProps) {
  return (
    <nav
      className={cn('font-serif text-sm text-muted-foreground', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

interface ContentCardProps {
  children: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  className?: string
  noPadding?: boolean
}

export function ContentCard({
  children,
  title,
  description,
  action,
  className,
  noPadding = false,
}: ContentCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <div>
            {title && (
              <h3 className="font-sans text-base font-semibold text-foreground">{title}</h3>
            )}
            {description && (
              <p className="mt-0.5 font-serif text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'p-4 md:p-6')}>{children}</div>
    </div>
  )
}

interface DataGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export function DataGrid({ children, columns = 3, className }: DataGridProps) {
  return <div className={cn('grid gap-4 md:gap-6', gridCols[columns], className)}>{children}</div>
}

interface StatCardProps {
  label: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  }

  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 md:p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-serif text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-sans text-2xl font-bold text-foreground md:text-3xl">{value}</p>
          {change && (
            <p className={cn('mt-1 font-sans text-sm font-medium', trendColors[change.trend])}>
              {change.trend === 'up' && '+'}
              {change.value}
            </p>
          )}
        </div>
        {icon && <div className="rounded-lg bg-secondary p-2 text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}
