'use client'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { AdminSettingsError, AdminSettingsOverviewPanel } from '@/src/features/admin/settings'
import { useAdminSettingsOverviewQuery } from '@/src/features/admin/settings/api/use-admin-settings-overview-query'

export default function AdminSettingsPage() {
  const settingsQuery = useAdminSettingsOverviewQuery()

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Configuración' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Configuración
          </h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Resumen operativo de identidad, marca, notificaciones, envíos y entorno.
          </p>
        </div>

        {settingsQuery.isError ? (
          <AdminSettingsError onRetry={() => void settingsQuery.refetch()} />
        ) : (
          <AdminSettingsOverviewPanel
            settings={settingsQuery.data}
            loading={settingsQuery.isLoading}
          />
        )}
      </div>
    </AdminPageConfig>
  )
}
