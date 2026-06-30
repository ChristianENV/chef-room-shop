'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AdminSidebar, type AdminEnvironment } from './admin-sidebar'
import { AdminTopbar, type AdminBreadcrumbItem } from './admin-topbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export interface AdminPageConfig {
  breadcrumb?: AdminBreadcrumbItem[]
  notificationCount?: number
  environment?: AdminEnvironment
}

const defaultConfig: AdminPageConfig = {
  breadcrumb: [],
  notificationCount: 0,
  environment: 'DEV',
}

const AdminPageConfigContext = createContext<{
  setPageConfig: (config: AdminPageConfig) => void
} | null>(null)

import type { UserDisplayInput } from '@/src/lib/user/user-display'

export type AdminShellUser = UserDisplayInput & {
  name: string
  email: string
}

export function AdminShell({
  children,
  adminUser,
}: {
  children: ReactNode
  adminUser?: AdminShellUser
}) {
  const [pageConfig, setPageConfig] = useState<AdminPageConfig>(defaultConfig)

  const contextValue = useMemo(() => ({ setPageConfig }), [])

  return (
    <AdminPageConfigContext.Provider value={contextValue}>
      <SidebarProvider className="min-h-svh overflow-x-hidden">
        <AdminSidebar environment={pageConfig.environment ?? 'DEV'} />
        <SidebarInset className="min-w-0 overflow-x-hidden">
          <AdminTopbar breadcrumb={pageConfig.breadcrumb} adminUser={adminUser} />
          <main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminPageConfigContext.Provider>
  )
}

export function AdminPageConfig({
  breadcrumb,
  notificationCount,
  environment = 'DEV',
  children,
}: AdminPageConfig & { children: ReactNode }) {
  const context = useContext(AdminPageConfigContext)
  const breadcrumbKey = JSON.stringify(breadcrumb)

  useEffect(() => {
    context?.setPageConfig({
      breadcrumb,
      notificationCount,
      environment,
    })

    return () => {
      context?.setPageConfig(defaultConfig)
    }
  }, [context, breadcrumb, notificationCount, environment, breadcrumbKey])

  return <>{children}</>
}
