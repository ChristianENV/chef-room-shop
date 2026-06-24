'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BRAND_COLORS, COLOR_USAGE } from '@/lib/brand'
import { cn } from '@/lib/utils'

interface ColorSwatchProps {
  name: string
  hex: string
  usage: string
  textColor?: 'light' | 'dark'
}

function ColorSwatch({ name, hex, usage, textColor = 'dark' }: ColorSwatchProps) {
  return (
    <Card className="overflow-hidden border-border">
      <div className="h-24 w-full" style={{ backgroundColor: hex }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-sans font-semibold text-foreground">{name}</h4>
            <p className="font-mono text-sm text-muted-foreground">{hex}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(hex)}
            className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted"
          >
            Copiar
          </button>
        </div>
        <Separator className="my-3" />
        <p className="font-serif text-sm text-muted-foreground">{usage}</p>
      </CardContent>
    </Card>
  )
}

export function ColorSystemSection() {
  const colors = [
    { name: 'Primary Blue', key: 'primary', textColor: 'light' as const },
    { name: 'Warm Gray', key: 'warmGray', textColor: 'dark' as const },
    { name: 'White', key: 'white', textColor: 'dark' as const },
    { name: 'Soft Black', key: 'softBlack', textColor: 'light' as const },
    { name: 'Deep Navy', key: 'deepNavy', textColor: 'light' as const },
    { name: 'Muted Text', key: 'muted', textColor: 'light' as const },
    { name: 'Border Neutral', key: 'border', textColor: 'dark' as const },
    { name: 'Success', key: 'success', textColor: 'light' as const },
    { name: 'Warning', key: 'warning', textColor: 'dark' as const },
    { name: 'Error', key: 'error', textColor: 'light' as const },
  ]

  return (
    <section id="colors" className="scroll-mt-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-sans text-xl">Sistema de Colores</CardTitle>
          <p className="font-serif text-muted-foreground">
            Paleta de colores oficial de Chef Room by Bedolla
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {colors.map(({ name, key, textColor }) => (
              <ColorSwatch
                key={key}
                name={name}
                hex={BRAND_COLORS[key as keyof typeof BRAND_COLORS]}
                usage={COLOR_USAGE[key as keyof typeof COLOR_USAGE]}
                textColor={textColor}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
