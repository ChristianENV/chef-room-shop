import { requireAdminSession } from '@/src/server/auth/require-admin'
import { hasPermission } from '@/src/server/auth/permissions'
import { AdminInvitationsPageContent } from '@/src/features/admin/users/components/admin-invitations-page-content'

export const metadata = { title: 'Invitaciones — Admin' }

export default async function AdminUsersInvitationsPage() {
  const currentUser = await requireAdminSession()
  const canWrite = hasPermission(currentUser, 'users.write')

  return <AdminInvitationsPageContent canWrite={canWrite} />
}
