'use client'

import { cn } from '@/lib/utils'
import type { CustomizerCategory, CustomizerCategoryItem } from '../lib/customizer-categories'

interface CustomizerLeftRailProps {
  categories: CustomizerCategoryItem[]
  active: CustomizerCategory
  onChange: (category: CustomizerCategory) => void
}

export function CustomizerLeftRail({ categories, active, onChange }: CustomizerLeftRailProps) {
  return (
    <nav
      data-testid="customizer-left-rail"
      aria-label="Categorías de personalización"
      className="flex h-full w-[68px] shrink-0 flex-col items-center gap-1 border-r border-border/40 bg-card/60 py-3"
    >
      {categories.map((category) => {
        const Icon = category.icon
        const isActive = active === category.id
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            aria-current={isActive ? 'page' : undefined}
            title={category.label}
            className={cn(
              'flex w-[58px] flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <Icon className="size-5" />
            <span className="leading-tight">{category.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
