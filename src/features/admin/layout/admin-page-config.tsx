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

export function AdminShell({ children }: { children: ReactNode }) {
  const [pageConfig, setPageConfig] = useState<AdminPageConfig>(defaultConfig)

  const contextValue = useMemo(() => ({ setPageConfig }), [])

  return (
    <AdminPageConfigContext.Provider value={contextValue}>
      <SidebarProvider>
        <AdminSidebar environment={pageConfig.environment ?? 'DEV'} />
        <SidebarInset>
          <AdminTopbar
            breadcrumb={pageConfig.breadcrumb}
            notificationCount={pageConfig.notificationCount}
          />
          <main className="flex-1 p-4 md:p-6">{children}</main>
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

  useEffect(() => {
    context?.setPageConfig({
      breadcrumb,
      notificationCount,
      environment,
    })

    return () => {
      context?.setPageConfig(defaultConfig)
    }
  }, [context, breadcrumb, notificationCount, environment, JSON.stringify(breadcrumb)])

  return <>{children}</>
}
