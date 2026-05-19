import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'

interface PublicLayoutProps {
  children: ReactNode
  cartItemCount?: number
  isLoggedIn?: boolean
  userName?: string
  showNewsletter?: boolean
  className?: string
}

export function PublicLayout({
  children,
  cartItemCount = 0,
  isLoggedIn = false,
  userName,
  showNewsletter = true,
  className,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader
        cartItemCount={cartItemCount}
        isLoggedIn={isLoggedIn}
        userName={userName}
      />
      <main className={cn('flex-1', className)}>{children}</main>
      <PublicFooter showNewsletter={showNewsletter} />
    </div>
  )
}
