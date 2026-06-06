import type { ReactNode } from 'react'

type OrderDetailLayoutProps = {
  header?: ReactNode
  hero: ReactNode
  timeline: ReactNode
  items: ReactNode
  events?: ReactNode
  sidebar: ReactNode
}

/**
 * Shared two-column order detail grid (main + sticky sidebar).
 */
export function OrderDetailLayout({
  header,
  hero,
  timeline,
  items,
  events,
  sidebar,
}: OrderDetailLayoutProps) {
  return (
    <div className="space-y-6">
      {header}
      {hero}

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          {timeline}
          {items}
          {events}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">{sidebar}</aside>
      </div>
    </div>
  )
}
