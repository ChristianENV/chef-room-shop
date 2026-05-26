import { AdminShell } from '@/src/features/admin/layout/admin-page-config'
import { requireAdminSession } from '@/src/server/auth/require-admin'

export default async function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireAdminSession()
  return (
    <AdminShell
      adminUser={{
        name: user.name,
        email: user.email,
        image: user.image,
        firstName: user.firstName,
        lastName: user.lastName,
      }}
    >
      {children}
    </AdminShell>
  )
}
