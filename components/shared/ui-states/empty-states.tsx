'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Search, 
  Package, 
  Palette, 
  BarChart3, 
  Database,
  FolderOpen,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

// Base Empty State Component
interface BaseEmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

function BaseEmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: BaseEmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-secondary p-4">
        {icon}
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            action.href ? (
              <Button asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button onClick={action.onClick}>{action.label}</Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// Empty Cart State
interface EmptyCartStateProps {
  onBrowseCatalog?: () => void
  onStartCustomizing?: () => void
  className?: string
}

export function EmptyCartState({ 
  onBrowseCatalog, 
  onStartCustomizing,
  className 
}: EmptyCartStateProps) {
  return (
    <BaseEmptyState
      icon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
      title="Tu carrito esta vacio"
      description="Explora nuestro catalogo de uniformes profesionales o comienza a disenar tu uniforme personalizado."
      action={{
        label: 'Explorar catálogo',
        href: '/shop',
        onClick: onBrowseCatalog,
      }}
      secondaryAction={{
        label: 'Disenar Uniforme',
        href: '/customize',
        onClick: onStartCustomizing,
      }}
      className={className}
    />
  )
}

// Empty Catalog State
interface EmptyCatalogStateProps {
  searchTerm?: string
  onClearFilters?: () => void
  className?: string
}

export function EmptyCatalogState({ 
  searchTerm,
  onClearFilters,
  className 
}: EmptyCatalogStateProps) {
  return (
    <BaseEmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title={searchTerm ? `No encontramos "${searchTerm}"` : 'No hay productos'}
      description={
        searchTerm 
          ? 'Intenta con otros terminos de busqueda o revisa los filtros aplicados.'
          : 'No hay productos disponibles con los filtros seleccionados.'
      }
      action={onClearFilters ? {
        label: 'Limpiar Filtros',
        onClick: onClearFilters,
      } : {
        label: 'Ver Todo el Catalogo',
        href: '/shop',
      }}
      className={className}
    />
  )
}

// Empty Orders State
interface EmptyOrdersStateProps {
  onStartShopping?: () => void
  className?: string
}

export function EmptyOrdersState({ 
  onStartShopping,
  className 
}: EmptyOrdersStateProps) {
  return (
    <BaseEmptyState
      icon={<Package className="h-8 w-8 text-muted-foreground" />}
      title="Aun no tienes pedidos"
      description="Cuando realices tu primera compra, aqui podras ver el historial y seguimiento de todos tus pedidos."
      action={{
        label: 'Explorar Productos',
        href: '/shop',
        onClick: onStartShopping,
      }}
      className={className}
    />
  )
}

// Empty Saved Designs State
interface EmptySavedDesignsStateProps {
  onStartDesigning?: () => void
  className?: string
}

export function EmptySavedDesignsState({ 
  onStartDesigning,
  className 
}: EmptySavedDesignsStateProps) {
  return (
    <BaseEmptyState
      icon={<Palette className="h-8 w-8 text-muted-foreground" />}
      title="No tienes disenos guardados"
      description="Crea y guarda tus disenos personalizados para comprarlos cuando quieras o compartirlos con tu equipo."
      action={{
        label: 'Crear Diseno',
        href: '/customize',
        onClick: onStartDesigning,
      }}
      className={className}
    />
  )
}

// Empty Admin Table State
interface EmptyAdminTableStateProps {
  entityName: string
  onAdd?: () => void
  addLabel?: string
  className?: string
}

export function EmptyAdminTableState({ 
  entityName,
  onAdd,
  addLabel,
  className 
}: EmptyAdminTableStateProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="py-16">
        <BaseEmptyState
          icon={<Database className="h-8 w-8 text-muted-foreground" />}
          title={`No hay ${entityName}`}
          description={`Aun no se han creado ${entityName}. Comienza agregando el primero.`}
          action={onAdd ? {
            label: addLabel || `Agregar ${entityName}`,
            onClick: onAdd,
          } : undefined}
        />
      </CardContent>
    </Card>
  )
}

// Empty Analytics State
interface EmptyAnalyticsStateProps {
  period?: string
  className?: string
}

export function EmptyAnalyticsState({ 
  period = 'este periodo',
  className 
}: EmptyAnalyticsStateProps) {
  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardContent className="py-16">
        <BaseEmptyState
          icon={<BarChart3 className="h-8 w-8 text-muted-foreground" />}
          title="Sin datos disponibles"
          description={`No hay suficientes datos para mostrar metricas de ${period}. Los datos apareceran cuando haya mas actividad.`}
        />
      </CardContent>
    </Card>
  )
}

// Empty Folder State (Generic)
interface EmptyFolderStateProps {
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyFolderState({ 
  title,
  description,
  action,
  className 
}: EmptyFolderStateProps) {
  return (
    <BaseEmptyState
      icon={<FolderOpen className="h-8 w-8 text-muted-foreground" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  )
}
