import dynamic from 'next/dynamic'

import { DashboardPageLoading } from '@/src/features/admin/dashboard/dashboard-page-loading'

const AdminDashboardContent = dynamic(
  () =>
    import('@/src/features/admin/dashboard/admin-dashboard-content').then(
      (mod) => mod.AdminDashboardContent,
    ),
  {
    loading: () => <DashboardPageLoading />,
  },
)

export default function AdminDashboardPage() {
  return <AdminDashboardContent />
}
