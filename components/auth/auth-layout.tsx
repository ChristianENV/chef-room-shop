'use client'

import { ChefRoomLogo } from '@/components/brand/chef-room-logo'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Brand Visual (hidden on mobile) */}
      <AuthBrandPanel />
      
      {/* Right Panel - Auth Form */}
      <div className={cn(
        'flex w-full flex-col bg-background lg:w-1/2',
        className
      )}>
        {/* Mobile Header with Logo */}
        <header className="flex items-center justify-between p-4 lg:hidden">
          <Link href="/">
            <ChefRoomLogo variant="horizontal" colorScheme="light" size="sm" />
          </Link>
        </header>
        
        {/* Form Container */}
        <main className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
        
        {/* Footer Links */}
        <footer className="p-6 text-center">
          <p className="font-serif text-xs text-muted-foreground">
            Al continuar, aceptas nuestros{' '}
            <Link href="/terminos" className="text-accent underline-offset-4 hover:underline">
              Terminos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacidad" className="text-accent underline-offset-4 hover:underline">
              Politica de Privacidad
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}

function AuthBrandPanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-12">
        {/* Logo */}
        <Link href="/">
          <ChefRoomLogo variant="vertical" colorScheme="light" size="xl" />
        </Link>
        
        {/* Customization Preview Mock */}
        <div className="mt-12 w-full max-w-sm">
          <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              {/* Mock Uniform Preview */}
              <div className="flex h-24 w-20 items-center justify-center rounded-lg bg-white/20">
                <svg className="h-12 w-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              
              {/* Mock Customization Options */}
              <div className="flex-1 space-y-2">
                <div className="h-2 w-3/4 rounded bg-white/30" />
                <div className="h-2 w-1/2 rounded bg-white/20" />
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-white" />
                  <div className="h-6 w-6 rounded-full bg-chef-deep-navy" />
                  <div className="h-6 w-6 rounded-full bg-chef-warm-gray" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tagline */}
        <div className="mt-12 text-center">
          <p className="font-sans text-xl font-semibold text-white">
            Disena, guarda y compra
          </p>
          <p className="font-sans text-xl font-semibold text-white">
            tus uniformes personalizados.
          </p>
          <p className="mt-4 font-serif text-sm text-white/70">
            Tu cocina te define, tu uniforme te distingue.
          </p>
        </div>
      </div>
      
      {/* Bottom decoration */}
      <div className="relative p-6">
        <div className="flex items-center justify-center gap-2 text-white/50">
          <span className="h-px flex-1 bg-white/20" />
          <span className="font-serif text-xs">Uniformes de Chef Premium</span>
          <span className="h-px flex-1 bg-white/20" />
        </div>
      </div>
    </div>
  )
}
