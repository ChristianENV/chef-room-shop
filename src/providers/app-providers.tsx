'use client'

import { AppTopLoader } from '@/components/shared/app-top-loader'
import { ThemeProvider } from '@/components/shared/theme-provider'

import { QueryProvider } from './query-provider'

/**
 * Root client providers: theme + TanStack Query.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppTopLoader />
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  )
}
