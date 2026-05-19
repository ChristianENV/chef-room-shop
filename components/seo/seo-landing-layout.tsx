import { ReactNode } from 'react'

import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { TrustBadgesRow } from '@/components/brand/cta-components'
import { cn } from '@/lib/utils'

interface SeoLandingLayoutProps {
  children: ReactNode
  showTrustBadges?: boolean
  className?: string
}

export function SeoLandingLayout({
  children,
  showTrustBadges = true,
  className,
}: SeoLandingLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <PublicHeader />
      
      <main className="flex-1">
        {children}
        
        {showTrustBadges && (
          <section className="border-y border-border bg-card px-4 py-8 md:px-6">
            <div className="mx-auto max-w-6xl">
              <TrustBadgesRow />
            </div>
          </section>
        )}
      </main>

      <PublicFooter showNewsletter />
    </div>
  )
}
