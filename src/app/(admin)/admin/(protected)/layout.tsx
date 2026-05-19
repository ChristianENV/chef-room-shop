import { AdminShell } from '@/src/features/admin/layout/admin-page-config'
import { requireAdminSession } from '@/src/server/auth/require-admin'

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireAdminSession()
  return <AdminShell>{children}</AdminShell>
}
