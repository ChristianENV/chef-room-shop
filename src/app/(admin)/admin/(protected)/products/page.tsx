'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  ProductsToolbar,
  ProductsTable,
  ProductsTableSkeleton,
  ProductFormDrawer,
  DeleteProductDialog,
  ProductsEmptyState,
  ProductsErrorState,
} from '@/src/features/admin/products'
import type { ProductFormData } from '@/src/features/admin/products/product-form-drawer'
import { fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/lib/mock-data'
import type { AdminProduct, AdminProductStatus } from '@/lib/types'

export default function AdminProductsPage() {
  // State
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [customizableOnly, setCustomizableOnly] = useState(false)
  const [sortBy, setSortBy] = useState('updated')

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<AdminProduct | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchAdminProducts()
      setProducts(data)
    } catch (err) {
      setError('Error loading products')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch products
  // TODO: Replace with TanStack Query useQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Customizable filter
    if (customizableOnly) {
      result = result.filter((p) => p.customizable)
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price':
        result.sort((a, b) => a.basePrice - b.basePrice)
        break
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'updated':
      default:
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
    }

    return result
  }, [products, search, categoryFilter, statusFilter, customizableOnly, sortBy])

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredProducts.map((p) => p.id) : [])
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    )
  }

  const handleCreateNew = () => {
    setEditingProduct(null)
    setDrawerOpen(true)
  }

  const handleView = (product: AdminProduct) => {
    // TODO: Navigate to product detail view
    console.log('View product:', product.id)
  }

  const handleEdit = (product: AdminProduct) => {
    setEditingProduct(product)
    setDrawerOpen(true)
  }

  const handleDuplicate = async (product: AdminProduct) => {
    // TODO: Replace with GraphQL mutation
    const duplicated = await createAdminProduct({
      ...product,
      name: `${product.name} (Copia)`,
      slug: `${product.slug}-copia`,
      sku: `${product.sku}-CPY`,
      status: 'borrador' as AdminProductStatus,
      sizes: product.sizes,
      colors: product.colors.map((c) => c.id),
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
    })
    setProducts((prev) => [duplicated, ...prev])
  }

  const handleArchive = async (product: AdminProduct) => {
    // TODO: Replace with GraphQL mutation
    const newStatus: AdminProductStatus = product.status === 'archivado' ? 'activo' : 'archivado'
    const updated = await updateAdminProduct(product.id, { status: newStatus })
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? updated : p))
    )
  }

  const handleDeleteClick = (product: AdminProduct) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    setIsDeleting(true)
    try {
      // TODO: Replace with GraphQL mutation
      await deleteAdminProduct(deletingProduct.id)
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))
      setDeleteDialogOpen(false)
      setDeletingProduct(null)
    } catch (err) {
      console.error('Error deleting product:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveProduct = async (data: ProductFormData) => {
    // TODO: Replace with GraphQL mutation
    if (editingProduct) {
      const updated = await updateAdminProduct(editingProduct.id, data)
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updated : p))
      )
    } else {
      const created = await createAdminProduct(data)
      setProducts((prev) => [created, ...prev])
    }
  }

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Productos' }]} environment="DEV">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">
              Productos
            </h1>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Gestiona filipinas, mandiles, pantalones y sus opciones comerciales.
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        {/* Toolbar */}
        <ProductsToolbar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          customizableOnly={customizableOnly}
          onCustomizableChange={setCustomizableOnly}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Content */}
        {isLoading ? (
          <ProductsTableSkeleton />
        ) : error ? (
          <ProductsErrorState onRetry={loadProducts} />
        ) : filteredProducts.length === 0 && products.length === 0 ? (
          <ProductsEmptyState onCreateClick={handleCreateNew} />
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="font-serif text-muted-foreground">
              No se encontraron productos con los filtros aplicados.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearch('')
                setCategoryFilter('all')
                setStatusFilter('all')
                setCustomizableOnly(false)
              }}
              className="mt-2"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            {/* Selection count */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-4 rounded-lg bg-primary/10 px-4 py-2">
                <span className="font-sans text-sm font-medium text-primary">
                  {selectedIds.length} producto{selectedIds.length > 1 ? 's' : ''} seleccionado{selectedIds.length > 1 ? 's' : ''}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  Deseleccionar
                </Button>
              </div>
            )}

            {/* Table */}
            <ProductsTable
              products={filteredProducts}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onView={handleView}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDeleteClick}
            />

            {/* Results count */}
            <p className="font-serif text-sm text-muted-foreground">
              Mostrando {filteredProducts.length} de {products.length} productos
            </p>
          </>
        )}
      </div>

      {/* Form Drawer */}
      <ProductFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={deletingProduct}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </AdminPageConfig>
  )
}
