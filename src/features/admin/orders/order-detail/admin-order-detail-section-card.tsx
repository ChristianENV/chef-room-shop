'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

type AdminOrderDetailSectionCardProps = {
  id?: string
  title: string
  icon?: LucideIcon
  description?: string
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function AdminOrderDetailSectionCard({
  id,
  title,
  icon: Icon,
  description,
  children,
  className,
  contentClassName,
}: AdminOrderDetailSectionCardProps) {
  return (
    <section id={id} className={cn('rounded-xl border border-border bg-card shadow-sm', className)}>
      <div className="border-b border-border/80 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
          <div>
            <h3 className="font-sans text-sm font-semibold text-foreground">{title}</h3>
            {description ? (
              <p className="mt-0.5 font-serif text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className={cn('p-5 sm:p-6', contentClassName)}>{children}</div>
    </section>
  )
}
