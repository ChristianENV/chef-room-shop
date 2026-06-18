'use client'

import type { ReactNode } from 'react'
import { AdminSidebar, type AdminEnvironment } from './admin-sidebar'
import { AdminTopbar, type AdminBreadcrumbItem } from './admin-topbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

/** @deprecated Prefer route layouts under (admin)/admin/(protected). Kept for /demo/admin previews. */
interface AdminLayoutProps {
  children: ReactNode
  breadcrumb?: AdminBreadcrumbItem[]
  environment?: AdminEnvironment
  notificationCount?: number
}

export function AdminLayout({
  children,
  breadcrumb = [],
  environment = 'DEV',
  notificationCount = 0,
}: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminSidebar environment={environment} />
      <SidebarInset>
        <AdminTopbar breadcrumb={breadcrumb} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export type { AdminBreadcrumbItem, AdminEnvironment }
