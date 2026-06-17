'use client'

import * as React from 'react'
import { UserAvatar } from '@/components/shared/user-avatar'
import { LogOut, Search } from 'lucide-react'
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

export function AdminTopbar({
  breadcrumb = [],
  adminUser,
}: AdminTopbarProps) {
  const handleSignOut = useAdminSignOut()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-card px-4">
      <SidebarTrigger className="-ml-1" />

      {breadcrumb.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
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

      <div className="flex-1" />

      <div className="hidden w-64 md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar..." className="pl-8 font-sans" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {adminUser && (
          <div className="flex items-center gap-2.5">
            <UserAvatar user={adminUser} size="sm" />
            <div className="hidden text-right sm:block">
              <p className="font-sans text-sm font-medium leading-none">
                {adminUser.name}
              </p>
              <p className="font-serif text-xs text-muted-foreground">
                {adminUser.email}
              </p>
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
