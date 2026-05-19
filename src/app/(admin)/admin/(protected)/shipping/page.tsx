'use client'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { AdminSectionPlaceholder } from '@/src/features/admin/shared/admin-section-placeholder'

export default function AdminShippingPage() {
  return (
    <AdminPageConfig breadcrumb={[{ label: 'Envíos' }]}>
      <AdminSectionPlaceholder
        title="Envíos"
        description="Configura métodos de envío, tarifas y seguimiento de pedidos."
      />
    </AdminPageConfig>
  )
}
