import Link from 'next/link'
import { ChefRoomLogo } from '@/components/brand/chef-room-logo'

interface AdminAuthLayoutProps {
  children: React.ReactNode
}

/**
 * Minimal layout for admin sign-in — no sidebar or commercial footer.
 */
export function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <Link href="/admin/login" className="inline-flex transition-opacity hover:opacity-80">
          <ChefRoomLogo variant="horizontal" colorScheme="auto" size="md" />
        </Link>
        <p className="mt-2 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Panel de administración
        </p>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
