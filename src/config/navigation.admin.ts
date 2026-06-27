import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  Box,
  CreditCard,
  Droplets,
  Home,
  Layers,
  Palette,
  Settings,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react'
import { routes } from '@/src/config/routes'

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

/** Flat admin sidebar navigation — no storefront links */
export const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard', href: routes.adminDashboard, icon: Home },
  { label: 'Productos', href: routes.adminProducts, icon: Box },
  { label: 'Categorías', href: routes.adminCategories, icon: Layers },
  { label: 'Colores', href: routes.adminColors, icon: Droplets },
  { label: 'Órdenes', href: routes.adminOrders, icon: ShoppingCart },
  { label: 'Personalización', href: routes.adminCustomization, icon: Palette },
  { label: 'Diseños', href: routes.adminDesigns, icon: Sparkles },
  { label: 'Usuarios', href: routes.adminUsers, icon: Users },
  { label: 'Pagos', href: routes.adminPayments, icon: CreditCard },
  { label: 'Envíos', href: routes.adminShipping, icon: Truck },
  { label: 'Notificaciones', href: routes.adminNotifications, icon: Bell },
  { label: 'Analytics', href: routes.adminAnalytics, icon: BarChart3 },
  { label: 'Configuración', href: routes.adminSettings, icon: Settings },
]
