'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { ProductTypeCommercialOptionsPanel } from '@/src/features/admin/product-types/components/product-type-commercial-options-panel'
import { routes } from '@/src/config/routes'

export default function AdminProductTypeOptionsPage() {
  return (
    <AdminPageConfig
      breadcrumb={[
        { label: 'Categorías', href: routes.adminCategories },
        { label: 'Opciones por tipo' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">
              Opciones por tipo de producto
            </h1>
            <p className="mt-1 max-w-2xl font-serif text-sm text-muted-foreground">
              Administra opciones comerciales globales (dry fit, bolsas, bordado, largo de mandil,
              etc.) por categoría. Los productos heredan estas opciones; un grupo con el mismo slug
              a nivel producto reemplaza el del tipo.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={routes.adminCategories}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a categorías
            </Link>
          </Button>
        </div>

        <ProductTypeCommercialOptionsPanel />
      </div>
    </AdminPageConfig>
  )
}
