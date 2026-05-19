import { AdminAuthLayout } from '@/src/features/admin/layout/admin-auth-layout'

export default function AdminAuthLayoutRoute({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AdminAuthLayout>{children}</AdminAuthLayout>
}
