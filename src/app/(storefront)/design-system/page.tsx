'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChefRoomLogo } from '@/components/brand'
import {
  ColorSystemSection,
  TypographySection,
  BrandSection,
  ShadcnComponentsSection,
  CoreComponentsSection,
  HomepagePreviewSection,
} from '@/components/shared/design-system'
import { routes } from '@/src/config/routes'
import { 
  Palette, 
  Type, 
  Layers, 
  Component, 
  LayoutDashboard,
  Sparkles,
  ExternalLink,
  Layout,
  ArrowLeft
} from 'lucide-react'

const sections = [
  { id: 'brand', label: 'Marca', icon: Sparkles },
  { id: 'colors', label: 'Colores', icon: Palette },
  { id: 'typography', label: 'Tipografia', icon: Type },
  { id: 'shadcn', label: 'shadcn/ui', icon: Layers },
  { id: 'components', label: 'Componentes', icon: Component },
  { id: 'preview', label: 'Preview', icon: LayoutDashboard },
]

const layoutDemos = [
  { href: '/demo/public', label: 'Public Layout', description: 'Header, footer, newsletter' },
  { href: '/demo/checkout', label: 'Checkout Layout', description: 'Minimal, secure checkout' },
  { href: '/demo/account', label: 'Account Layout', description: 'Sidebar navigation' },
  { href: '/demo/admin', label: 'Admin Layout', description: 'Collapsible sidebar, topbar' },
]

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('brand')

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={routes.home} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden font-sans text-sm md:inline">Volver</span>
              </Link>
              <div className="hidden h-6 w-px bg-border md:block" />
              <ChefRoomLogo variant="horizontal" colorScheme="light" size="md" />
              <div className="hidden h-6 w-px bg-border md:block" />
              <span className="hidden font-sans text-sm font-medium text-muted-foreground md:block">
                Sistema de Diseno
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="font-sans text-3xl font-bold text-foreground md:text-4xl lg:text-5xl text-balance">
            Chef Room Design System
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground text-pretty">
            Sistema de diseno completo para la plataforma de uniformes de chef personalizables. 
            Incluye tokens de marca, tipografia, componentes y guias de uso.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <span className="font-sans text-sm font-medium text-primary">
              Tu cocina te define, tu uniforme te distingue
            </span>
          </div>
        </div>

        {/* Layout Demos */}
        <div className="mb-12 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            <h2 className="font-sans text-lg font-semibold text-foreground">
              Demos de Layouts
            </h2>
          </div>
          <p className="mb-6 font-serif text-sm text-muted-foreground">
            Explora los diferentes layouts disponibles para la plataforma.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {layoutDemos.map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                className="group rounded-lg border border-border bg-secondary/50 p-4 transition-all hover:border-primary hover:bg-secondary"
              >
                <h3 className="font-sans text-sm font-semibold text-foreground group-hover:text-primary">
                  {demo.label}
                </h3>
                <p className="mt-1 font-serif text-xs text-muted-foreground">
                  {demo.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex justify-center gap-2 pb-2">
            {sections.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeSection === id ? 'default' : 'outline'}
                size="sm"
                onClick={() => scrollToSection(id)}
                className="whitespace-nowrap"
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          <BrandSection />
          <ColorSystemSection />
          <TypographySection />
          <ShadcnComponentsSection />
          <CoreComponentsSection />
          <HomepagePreviewSection />
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center">
          <ChefRoomLogo variant="horizontal" colorScheme="light" size="sm" className="mx-auto" />
          <p className="mt-4 font-serif text-sm text-muted-foreground">
            Sistema de diseno creado para Chef Room by Bedolla
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Next.js - TypeScript - TailwindCSS - shadcn/ui
          </p>
        </footer>
      </div>
    </div>
  )
}
