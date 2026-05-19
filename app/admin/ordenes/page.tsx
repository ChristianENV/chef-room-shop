'use client'

import { useState, useEffect, useMemo } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import {
  OrdersStatusCards,
  OrdersToolbar,
  OrdersTable,
  OrderDetailDrawer,
} from '@/components/admin/orders'
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  addTrackingNumber,
} from '@/lib/mock-data'
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
  AdminProductionStatus,
} from '@/lib/types'

export default function AdminOrdersPage() {
  // State
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<AdminPaymentStatus | 'all'>('all')
  const [productionFilter, setProductionFilter] = useState<AdminProductionStatus | 'all'>('all')
  const [cardStatusFilter, setCardStatusFilter] = useState<AdminOrderStatus | null>(null)

  // Fetch orders
  // TODO: Replace with TanStack Query useQuery
  useEffect(() => {
    async function loadOrders() {
      setLoading(true)
      try {
        const data = await fetchAdminOrders()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<AdminOrderStatus, number> = {
      'pendiente-pago': 0,
      'pagado': 0,
      'en-produccion': 0,
      'listo-envio': 0,
      'enviado': 0,
      'entregado': 0,
      'cancelado': 0,
    }
    orders.forEach((order) => {
      counts[order.status]++
    })
    return counts
  }, [orders])

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Card status filter takes precedence
    if (cardStatusFilter) {
      result = result.filter((o) => o.status === cardStatusFilter)
    } else if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter)
    }

    if (paymentFilter !== 'all') {
      result = result.filter((o) => o.paymentStatus === paymentFilter)
    }

    if (productionFilter !== 'all') {
      result = result.filter((o) => o.productionStatus === productionFilter)
    }

    if (searchQuery) {
      const search = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customer.name.toLowerCase().includes(search) ||
          o.customer.email.toLowerCase().includes(search)
      )
    }

    return result
  }, [orders, cardStatusFilter, statusFilter, paymentFilter, productionFilter, searchQuery])

  // Handlers
  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleStatusChange = async (status: AdminOrderStatus) => {
    if (!selectedOrder) return

    // TODO: Replace with TanStack Query useMutation
    try {
      const updated = await updateAdminOrderStatus(selectedOrder.id, status)
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: updated.status } : o))
      )
      setSelectedOrder((prev) => (prev ? { ...prev, status: updated.status } : null))
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const handleAddTracking = async (trackingNumber: string, carrier: string) => {
    if (!selectedOrder) return

    // TODO: Replace with TanStack Query useMutation
    try {
      const updated = await addTrackingNumber(selectedOrder.id, trackingNumber, carrier)
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, trackingNumber: updated.trackingNumber, trackingUrl: updated.trackingUrl, status: updated.status }
            : o
        )
      )
      setSelectedOrder((prev) =>
        prev
          ? { ...prev, trackingNumber: updated.trackingNumber, trackingUrl: updated.trackingUrl, status: updated.status }
          : null
      )
    } catch (error) {
      console.error('Failed to add tracking:', error)
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrder) return

    // TODO: Replace with TanStack Query useMutation
    try {
      await updateAdminOrderStatus(selectedOrder.id, 'cancelado')
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'cancelado' } : o))
      )
      setSelectedOrder((prev) => (prev ? { ...prev, status: 'cancelado' } : null))
    } catch (error) {
      console.error('Failed to cancel order:', error)
    }
  }

  const handleMoveToProduction = async (order: AdminOrder) => {
    // TODO: Replace with TanStack Query useMutation
    try {
      const updated = await updateAdminOrderStatus(order.id, 'en-produccion')
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: updated.status, productionStatus: 'en-cola' } : o))
      )
    } catch (error) {
      console.error('Failed to move to production:', error)
    }
  }

  const handleMarkReadyToShip = async (order: AdminOrder) => {
    // TODO: Replace with TanStack Query useMutation
    try {
      const updated = await updateAdminOrderStatus(order.id, 'listo-envio')
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: updated.status, productionStatus: 'completado' } : o))
      )
    } catch (error) {
      console.error('Failed to mark ready to ship:', error)
    }
  }

  const handleAddTrackingFromTable = (order: AdminOrder) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleExport = () => {
    // TODO: Implement CSV/Excel export
    console.log('Exporting orders...', filteredOrders)
  }

  const handleCreateManual = () => {
    // TODO: Implement manual order creation dialog
    console.log('Creating manual order...')
  }

  const handleDownloadProductionSheet = (order: AdminOrder) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleCardStatusSelect = (status: AdminOrderStatus | null) => {
    setCardStatusFilter(status)
    // Reset dropdown filter when using cards
    if (status) {
      setStatusFilter('all')
    }
  }

  return (
    <AdminLayout
      breadcrumb={[{ label: 'Ordenes' }]}
      notificationCount={statusCounts['pendiente-pago']}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">Ordenes</h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Gestiona pagos, produccion, personalizaciones y envios.
          </p>
        </div>

        {/* Status Summary Cards */}
        <OrdersStatusCards
          counts={statusCounts}
          selectedStatus={cardStatusFilter}
          onStatusSelect={handleCardStatusSelect}
        />

        {/* Toolbar */}
        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v)
            setCardStatusFilter(null)
          }}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          productionFilter={productionFilter}
          onProductionFilterChange={setProductionFilter}
          onExport={handleExport}
          onCreateManual={handleCreateManual}
        />

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          loading={loading}
          onViewOrder={handleViewOrder}
          onMoveToProduction={handleMoveToProduction}
          onMarkReadyToShip={handleMarkReadyToShip}
          onAddTracking={handleAddTrackingFromTable}
          onCancelOrder={(order) => {
            setSelectedOrder(order)
            handleCancelOrder()
          }}
          onDownloadProductionSheet={handleDownloadProductionSheet}
        />

        {/* Order Detail Drawer */}
        <OrderDetailDrawer
          order={selectedOrder}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onStatusChange={handleStatusChange}
          onAddTracking={handleAddTracking}
          onCancel={handleCancelOrder}
        />
      </div>
    </AdminLayout>
  )
}
