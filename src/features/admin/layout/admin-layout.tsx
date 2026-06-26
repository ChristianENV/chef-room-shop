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
    <SidebarProvider className="min-h-svh overflow-x-hidden">
      <AdminSidebar environment={environment} />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <AdminTopbar breadcrumb={breadcrumb} />
        <main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export type { AdminBreadcrumbItem, AdminEnvironment }
