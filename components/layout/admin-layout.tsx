'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Box,
  ChevronDown,
  CreditCard,
  Home,
  Layers,
  LogOut,
  Package,
  Palette,
  PaintBucket,
  Ruler,
  Search,
  Settings,
  Shirt,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ChefRoomLogo } from '@/components/brand/chef-room-logo'

type Environment = 'DEV' | 'NP' | 'PROD'

const envConfig: Record<Environment, { label: string; color: string }> = {
  DEV: { label: 'Desarrollo', color: 'bg-warning text-warning-foreground' },
  NP: { label: 'Pre-Produccion', color: 'bg-accent text-accent-foreground' },
  PROD: { label: 'Produccion', color: 'bg-success text-success-foreground' },
}

const adminNavItems = [
  {
    group: 'General',
    items: [
      { href: '/admin', label: 'Dashboard', icon: Home },
      { href: '/admin/ordenes', label: 'Ordenes', icon: ShoppingCart },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    group: 'Catalogo',
    items: [
      { href: '/admin/productos', label: 'Productos', icon: Box },
      { href: '/admin/tipos-prendas', label: 'Tipos de Prendas', icon: Shirt },
      { href: '/admin/variantes', label: 'Variantes', icon: Layers },
      { href: '/admin/colores', label: 'Colores', icon: PaintBucket },
      { href: '/admin/tallas', label: 'Tallas', icon: Ruler },
    ],
  },
  {
    group: 'Personalizacion',
    items: [
      { href: '/admin/customizecion', label: 'Reglas', icon: Palette },
      { href: '/admin/disenos', label: 'Disenos', icon: Sparkles },
    ],
  },
  {
    group: 'Clientes',
    items: [
      { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
      { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
      { href: '/admin/envios', label: 'Envios', icon: Truck },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { href: '/admin/configuracion', label: 'Configuracion', icon: Settings },
    ],
  },
]

interface BreadcrumbItem {
  label: string
  href?: string
}

interface EnvironmentBadgeProps {
  environment: Environment
}

function EnvironmentBadge({ environment }: EnvironmentBadgeProps) {
  const config = envConfig[environment]

  return (
    <span
      className={cn(
        'rounded-md px-2 py-0.5 font-sans text-xs font-semibold uppercase',
        config.color
      )}
    >
      {config.label}
    </span>
  )
}

interface AdminSidebarContentProps {
  environment: Environment
}

function AdminSidebarContent({ environment }: AdminSidebarContentProps) {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <ChefRoomLogo variant="symbol" colorScheme="light" size="md" />
          <div className="flex flex-col gap-0.5">
            <span className="font-sans text-sm font-semibold text-sidebar-foreground">
              Chef Room
            </span>
            <EnvironmentBadge environment={environment} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {adminNavItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="font-sans text-xs uppercase tracking-wider">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span className="font-sans">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                A
              </div>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="font-sans text-sm font-medium">Admin</span>
                <span className="font-serif text-xs text-muted-foreground">
                  admin@chefroom.mx
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/admin/configuracion">
                <Settings className="mr-2 h-4 w-4" />
                Configuracion
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  )
}

interface AdminTopbarProps {
  breadcrumb?: BreadcrumbItem[]
  notificationCount?: number
}

function AdminTopbar({ breadcrumb = [], notificationCount = 0 }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-card px-4">
      <SidebarTrigger className="-ml-1" />

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin" className="font-sans">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumb.map((item, index) => (
              <BreadcrumbItem key={index}>
                <BreadcrumbSeparator />
                {item.href ? (
                  <BreadcrumbLink href={item.href} className="font-sans">
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-sans">{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden w-64 md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8 font-sans"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </div>
    </header>
  )
}

interface AdminLayoutProps {
  children: ReactNode
  breadcrumb?: BreadcrumbItem[]
  environment?: Environment
  notificationCount?: number
}

export function AdminLayout({
  children,
  breadcrumb = [],
  environment = 'DEV',
  notificationCount = 0,
}: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon">
        <AdminSidebarContent environment={environment} />
      </Sidebar>
      <SidebarInset>
        <AdminTopbar breadcrumb={breadcrumb} notificationCount={notificationCount} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
