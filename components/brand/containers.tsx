import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface BrandContainerProps {
  children: ReactNode
  variant?: 'default' | 'card' | 'surface' | 'premium' | 'primary'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const variantClasses = {
  default: 'bg-background',
  card: 'bg-card border border-border rounded-lg shadow-sm',
  surface: 'bg-chef-warm-gray',
  premium: 'bg-chef-deep-navy text-white',
  primary: 'bg-primary text-primary-foreground',
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
  xl: 'p-8 md:p-12',
}

export function BrandContainer({
  children,
  variant = 'default',
  padding = 'md',
  className,
}: BrandContainerProps) {
  return (
    <div className={cn(variantClasses[variant], paddingClasses[padding], className)}>
      {children}
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  align = 'left',
  size = 'md',
  className,
}: SectionHeaderProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const titleSizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
  }

  return (
    <div className={cn('mb-6', alignClasses[align], className)}>
      <h2 className={cn('font-sans font-semibold text-foreground', titleSizeClasses[size])}>
        {title}
      </h2>
      {subtitle && <p className="mt-1 font-serif text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumb?: { label: string; href?: string }[]
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, breadcrumb, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 md:mb-12', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-4 font-serif text-sm text-muted-foreground">
          {breadcrumb.map((item, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-2">/</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </a>
              ) : (
                <span className="text-foreground">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold text-foreground md:text-4xl lg:text-5xl text-balance">
            {title}
          </h1>
          {description && (
            <p className="mt-2 font-serif text-lg text-muted-foreground max-w-2xl text-pretty">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
