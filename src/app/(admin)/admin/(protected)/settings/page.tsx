'use client'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { AdminSectionPlaceholder } from '@/src/features/admin/shared/admin-section-placeholder'

export default function AdminSettingsPage() {
  return (
    <AdminPageConfig breadcrumb={[{ label: 'Configuración' }]}>
      <AdminSectionPlaceholder
        title="Configuración"
        description="Ajustes generales de la tienda, notificaciones y preferencias del panel."
      />
    </AdminPageConfig>
  )
}
