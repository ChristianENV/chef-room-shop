import { requireAdminSession } from '@/src/server/auth/require-admin'
import { hasPermission } from '@/src/server/auth/permissions'
import { AdminUsersSegmentPage } from '@/src/features/admin/users/components/admin-users-segment-page'

export const metadata = { title: 'Clientes — Admin' }

export default async function AdminUsersCustomersPage() {
  const currentUser = await requireAdminSession()
  const canWrite = hasPermission(currentUser, 'users.write')

  return (
    <AdminUsersSegmentPage
      segment="CUSTOMERS"
      title="Clientes"
      description="Cuentas de compradores. No incluye usuarios con rol Admin o Superadmin."
      showCustomerTier
      showDeletedStatus={canWrite}
      canWrite={canWrite}
    />
  )
}
