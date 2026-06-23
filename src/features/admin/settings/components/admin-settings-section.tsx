'use client'

import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type AdminSettingsSectionProps = {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  testId?: string
}

export function AdminSettingsSection({
  title,
  description,
  icon,
  children,
  className,
  testId,
}: AdminSettingsSectionProps) {
  return (
    <Card className={cn('border-border', className)} data-testid={testId}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-sans text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="font-serif">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

type AdminSettingsFieldProps = {
  label: string
  value: ReactNode
  mono?: boolean
}

export function AdminSettingsField({ label, value, mono }: AdminSettingsFieldProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
      <dt className="font-serif text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn('font-sans text-sm text-foreground', mono && 'font-mono text-xs break-all')}
      >
        {value}
      </dd>
    </div>
  )
}
