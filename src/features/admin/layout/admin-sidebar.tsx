'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { adminNavItems } from '@/src/config/navigation.admin'
import { routes } from '@/src/config/routes'
import { useAdminSignOut } from './use-admin-sign-out'

export type AdminEnvironment = 'DEV' | 'NP' | 'PROD'

const envConfig: Record<AdminEnvironment, { label: string; color: string }> = {
  DEV: { label: 'Desarrollo', color: 'bg-warning text-warning-foreground' },
  NP: { label: 'Pre-Produccion', color: 'bg-accent text-accent-foreground' },
  PROD: { label: 'Produccion', color: 'bg-success text-success-foreground' },
}

function EnvironmentBadge({ environment }: { environment: AdminEnvironment }) {
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

const LOGO_WIDTH = 963
const LOGO_HEIGHT = 222

function AdminSidebarLogo() {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <span className="font-sans text-sm font-semibold leading-tight text-sidebar-foreground">
        Chef Room by Bedolla
      </span>
    )
  }

  return (
    <Image
      src="/chef-room-logo.png"
      alt="Chef Room by Bedolla"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      onError={() => setImageError(true)}
      className="h-7 w-auto max-w-[9.5rem] shrink-0 object-contain object-left mix-blend-screen"
    />
  )
}

interface AdminSidebarProps {
  environment?: AdminEnvironment
}

export function AdminSidebar({ environment = 'DEV' }: AdminSidebarProps) {
  const pathname = usePathname()
  const handleSignOut = useAdminSignOut()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Link
            href={routes.adminDashboard}
            className="inline-flex shrink-0 transition-opacity hover:opacity-90"
            aria-label="Chef Room by Bedolla"
          >
            <AdminSidebarLogo />
          </Link>
          <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <EnvironmentBadge environment={environment} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
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
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                A
              </div>
              <div className="flex flex-1 flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                <span className="font-sans text-sm font-medium">Admin</span>
                <span className="font-serif text-xs text-muted-foreground">
                  admin@chefroom.mx
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href={routes.adminSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => void handleSignOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
