'use client'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { AdminSectionPlaceholder } from '@/src/features/admin/shared/admin-section-placeholder'

export default function AdminDesignsPage() {
  return (
    <AdminPageConfig breadcrumb={[{ label: 'Diseños' }]}>
      <AdminSectionPlaceholder
        title="Diseños"
        description="Gestiona diseños guardados y personalizaciones de clientes desde un solo lugar."
      />
    </AdminPageConfig>
  )
}
