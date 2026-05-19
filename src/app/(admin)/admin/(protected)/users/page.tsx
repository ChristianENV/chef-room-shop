'use client'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { AdminSectionPlaceholder } from '@/src/features/admin/shared/admin-section-placeholder'

export default function AdminUsersPage() {
  return (
    <AdminPageConfig breadcrumb={[{ label: 'Usuarios' }]}>
      <AdminSectionPlaceholder
        title="Usuarios"
        description="Administra cuentas de clientes, roles y acceso al panel cuando la autenticación esté integrada."
      />
    </AdminPageConfig>
  )
}
