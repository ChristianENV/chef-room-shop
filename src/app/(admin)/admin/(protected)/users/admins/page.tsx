import { requireAdminSession } from '@/src/server/auth/require-admin'
import { hasPermission } from '@/src/server/auth/permissions'
import { AdminUsersSegmentPage } from '@/src/features/admin/users/components/admin-users-segment-page'

export const metadata = { title: 'Equipo / Admin — Admin' }

export default async function AdminUsersAdminsPage() {
  const currentUser = await requireAdminSession()
  const canWrite = hasPermission(currentUser, 'users.write')

  return (
    <AdminUsersSegmentPage
      segment="ADMINS"
      title="Equipo / Admin"
      description="Usuarios con rol Administrador o Superadmin."
      showDeletedStatus={canWrite}
      canWrite={canWrite}
    />
  )
}
