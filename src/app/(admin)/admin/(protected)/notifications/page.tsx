'use client'

import { AdminNotificationsPageContent } from '@/src/features/admin/notifications/components/admin-notifications-page-content'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'

export default function AdminNotificationsPage() {
  return (
    <AdminPageConfig breadcrumb={[{ label: 'Notificaciones' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Notificaciones
          </h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Avisos operativos del panel de administración
          </p>
        </div>
        <AdminNotificationsPageContent />
      </div>
    </AdminPageConfig>
  )
}
