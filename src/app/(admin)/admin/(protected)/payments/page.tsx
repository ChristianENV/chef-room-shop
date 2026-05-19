'use client'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { AdminSectionPlaceholder } from '@/src/features/admin/shared/admin-section-placeholder'

export default function AdminPaymentsPage() {
  return (
    <AdminPageConfig breadcrumb={[{ label: 'Pagos' }]}>
      <AdminSectionPlaceholder
        title="Pagos"
        description="Consulta transacciones, reembolsos y conciliación de pagos en línea."
      />
    </AdminPageConfig>
  )
}
