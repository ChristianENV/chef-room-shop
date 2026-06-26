'use client'

import * as React from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/components/shared/user-avatar'
import { LogOut, Search, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { routes } from '@/src/config/routes'
import type { AdminShellUser } from './admin-page-config'
import { AdminNotificationPopover } from '@/src/features/admin/notifications/components/admin-notification-popover'
import { useAdminSignOut } from './use-admin-sign-out'

export interface AdminBreadcrumbItem {
  label: string
  href?: string
}

interface AdminTopbarProps {
  breadcrumb?: AdminBreadcrumbItem[]
  adminUser?: AdminShellUser
}

export function AdminTopbar({ breadcrumb = [], adminUser }: AdminTopbarProps) {
  const handleSignOut = useAdminSignOut()

  return (
    <header className="sticky top-0 z-40 flex h-14 min-w-0 w-full items-center gap-2 overflow-hidden border-b border-border bg-card px-4 md:gap-4">
      <SidebarTrigger className="-ml-1 shrink-0" />

      {breadcrumb.length > 0 && (
        <Breadcrumb className="hidden min-w-0 sm:block">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink href={routes.adminDashboard} className="font-sans">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href} className="font-sans">
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="font-sans">{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="min-w-0 flex-1" />

      <div className="hidden min-w-0 max-w-64 md:block lg:w-64 lg:max-w-none">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar..." className="w-full pl-8 font-sans" />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="icon" asChild className="shrink-0 sm:hidden">
          <Link href={routes.home} aria-label="Ver tienda">
            <Store className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="hidden shrink-0 sm:inline-flex">
          <Link href={routes.home}>
            <Store className="mr-2 h-4 w-4" />
            Ver tienda
          </Link>
        </Button>
        {adminUser && (
          <div className="hidden min-w-0 items-center gap-2.5 md:flex">
            <UserAvatar user={adminUser} size="sm" />
            <div className="hidden min-w-0 text-right lg:block">
              <p className="truncate font-sans text-sm font-medium leading-none">
                {adminUser.name}
              </p>
              <p className="truncate font-serif text-xs text-muted-foreground">{adminUser.email}</p>
            </div>
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void handleSignOut()}
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Cerrar sesión</span>
        </Button>
        <AdminNotificationPopover />
      </div>
    </header>
  )
}
