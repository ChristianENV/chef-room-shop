'use client'

import { use } from 'react'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { AdminOrderDetailPageView } from '@/src/features/admin/orders/order-detail/admin-order-detail-page-view'
import { routes } from '@/src/config/routes'

type AdminOrderDetailPageProps = {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ tab?: string }>
}

function parseInitialTab(
  tab: string | undefined,
): 'details' | 'items' | 'timeline' | 'production' {
  if (tab === 'items' || tab === 'timeline' || tab === 'production') return tab
  return 'details'
}

export default function AdminOrderDetailPage({ params, searchParams }: AdminOrderDetailPageProps) {
  const { orderNumber } = use(params)
  const { tab } = use(searchParams)
  const decodedOrderNumber = decodeURIComponent(orderNumber)
  const initialTab = parseInitialTab(tab)

  return (
    <AdminPageConfig
      breadcrumb={[
        { label: 'Dashboard', href: routes.adminDashboard },
        { label: 'Órdenes', href: routes.adminOrders },
        { label: decodedOrderNumber },
      ]}
    >
      <AdminOrderDetailPageView
        orderNumber={decodedOrderNumber}
        initialTab={initialTab}
      />
    </AdminPageConfig>
  )
}
