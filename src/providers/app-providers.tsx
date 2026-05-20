'use client'

import { ThemeProvider } from '@/components/shared/theme-provider'

import { QueryProvider } from './query-provider'

/**
 * Root client providers: theme + TanStack Query.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  )
}
