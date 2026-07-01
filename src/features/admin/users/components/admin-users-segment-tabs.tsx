'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'

const TABS = [
  { label: 'Clientes', href: routes.adminUsersCustomers },
  { label: 'Equipo / Admin', href: routes.adminUsersAdmins },
] as const

export function AdminUsersSegmentTabs() {
  const pathname = usePathname()

  return (
    <div
      className="flex gap-1 border-b border-border"
      role="tablist"
      aria-label="Segmento de usuarios"
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'px-4 py-2 font-sans text-sm font-medium transition-colors',
              isActive
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            data-testid={`admin-users-tab-${tab.href.split('/').pop()}`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
