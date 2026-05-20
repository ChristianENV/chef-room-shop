'use client'
import { routes } from '@/src/config/routes'

import Link from 'next/link'
import { 
  Calendar, 
  CreditCard, 
  Edit, 
  Mail, 
  MapPin, 
  Package, 
  Palette, 
  Phone,
  Star,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { UserProfile, Address, Order, SavedDesign } from '@/lib/types'

interface ProfileSummaryProps {
  user: UserProfile
  defaultAddress?: Address
  recentOrders: Order[]
  savedDesigns: SavedDesign[]
}

export function ProfileSummary({
  user,
  defaultAddress,
  recentOrders,
  savedDesigns,
}: ProfileSummaryProps) {
  const statusLabel = {
    regular: 'Cliente',
    premium: 'Cliente Premium',
    vip: 'Cliente VIP',
  }

  const statusColor = {
    regular: 'bg-muted text-muted-foreground',
    premium: 'bg-primary text-primary-foreground',
    vip: 'bg-warning text-warning-foreground',
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* User Info Card */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-sans text-lg">Informacion Personal</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={routes.account}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="font-sans text-lg font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </h3>
              <Badge className={cn('mt-1', statusColor[user.customerStatus])}>
                <Star className="mr-1 h-3 w-3" />
                {statusLabel[user.customerStatus]}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-serif text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-serif text-foreground">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-serif text-muted-foreground">
                Cliente desde {new Date(user.createdAt).toLocaleDateString('es-MX', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Address Card */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-sans text-lg">Direccion Principal</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${routes.account}/addresses`}>
              <MapPin className="mr-2 h-4 w-4" />
              Gestionar
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {defaultAddress ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{defaultAddress.label}</Badge>
                {defaultAddress.isDefaultShipping && (
                  <Badge variant="secondary" className="text-xs">Envio</Badge>
                )}
              </div>
              <p className="font-serif text-sm text-foreground">
                {defaultAddress.firstName} {defaultAddress.lastName}
              </p>
              <p className="font-serif text-sm text-muted-foreground">
                {defaultAddress.street} {defaultAddress.exteriorNumber}
                {defaultAddress.interiorNumber && `, ${defaultAddress.interiorNumber}`}
              </p>
              <p className="font-serif text-sm text-muted-foreground">
                {defaultAddress.neighborhood}, {defaultAddress.city}
              </p>
              <p className="font-serif text-sm text-muted-foreground">
                {defaultAddress.state}, CP {defaultAddress.postalCode}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <MapPin className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="font-serif text-sm text-muted-foreground">
                Agrega una dirección para agilizar tus compras.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={`${routes.account}/addresses`}>Agregar direccion</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders Card */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-sans text-lg">Pedidos Recientes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${routes.account}/orders`}>
              <Package className="mr-2 h-4 w-4" />
              Ver todos
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.slice(0, 3).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="font-serif text-xs text-muted-foreground">
                      {new Date(order.date).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="mt-1 font-sans text-sm font-semibold text-foreground">
                      ${order.total.toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Package className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="font-serif text-sm text-muted-foreground">
                Aún no tienes pedidos.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={routes.shop}>Explorar productos</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Designs Card */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-sans text-lg">Disenos Guardados</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${routes.account}/designs`}>
              <Palette className="mr-2 h-4 w-4" />
              Ver todos
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {savedDesigns.length > 0 ? (
            <div className="space-y-3">
              {savedDesigns.slice(0, 3).map((design) => (
                <div 
                  key={design.id} 
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Palette className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-foreground truncate">
                      {design.name}
                    </p>
                    <p className="font-serif text-xs text-muted-foreground">
                      {design.productName}
                    </p>
                  </div>
                  <DesignStatusBadge status={design.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Palette className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="font-serif text-sm text-muted-foreground">
                Aún no tienes diseños guardados.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link href={routes.customize}>Crear diseno</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Status Card */}
      <Card className="border-border bg-card md:col-span-2">
        <CardHeader>
          <CardTitle className="font-sans text-lg">Estado de Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-sans font-semibold text-foreground">
                  {statusLabel[user.customerStatus]}
                </p>
                <p className="font-serif text-sm text-muted-foreground">
                  {user.customerStatus === 'premium' 
                    ? 'Disfrutas de envio gratis en todos tus pedidos'
                    : 'Completa 3 pedidos mas para ser Cliente Premium'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-sans text-2xl font-bold text-primary">
                  {recentOrders.length}
                </p>
                <p className="font-serif text-xs text-muted-foreground">Pedidos</p>
              </div>
              <div className="text-center">
                <p className="font-sans text-2xl font-bold text-primary">
                  {savedDesigns.length}
                </p>
                <p className="font-serif text-xs text-muted-foreground">Disenos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
import type { OrderStatus, SavedDesignStatus } from '@/lib/types'

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { label: string; className: string }> = {
    'pendiente': { label: 'Pendiente', className: 'bg-warning/10 text-warning' },
    'pagado': { label: 'Pagado', className: 'bg-success/10 text-success' },
    'en-produccion': { label: 'En produccion', className: 'bg-primary/10 text-primary' },
    'enviado': { label: 'Enviado', className: 'bg-accent/10 text-accent' },
    'entregado': { label: 'Entregado', className: 'bg-success/10 text-success' },
    'cancelado': { label: 'Cancelado', className: 'bg-destructive/10 text-destructive' },
  }

  return (
    <Badge className={cn('text-xs', config[status].className)}>
      {config[status].label}
    </Badge>
  )
}

function DesignStatusBadge({ status }: { status: SavedDesignStatus }) {
  const config: Record<SavedDesignStatus, { label: string; className: string }> = {
    'borrador': { label: 'Borrador', className: 'bg-muted text-muted-foreground' },
    'en-carrito': { label: 'En carrito', className: 'bg-primary/10 text-primary' },
    'comprado': { label: 'Comprado', className: 'bg-success/10 text-success' },
  }

  return (
    <Badge className={cn('text-xs', config[status].className)}>
      {config[status].label}
    </Badge>
  )
}
