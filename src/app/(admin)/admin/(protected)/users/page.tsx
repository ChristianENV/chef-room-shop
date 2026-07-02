import { redirect } from 'next/navigation'

import { routes } from '@/src/config/routes'

/**
 * /admin/users redirects to the customers sub-view.
 * Use /admin/users/customers or /admin/users/admins directly.
 */
export default function AdminUsersPage() {
  redirect(routes.adminUsersCustomers)
}
