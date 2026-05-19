'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// TODO: Replace with TanStack Query for real-time designs
export interface RecentDesign {
  id: string
  previewUrl: string
  productName: string
  productType: 'filipina' | 'mandil' | 'pantalon'
  userName: string
  userEmail: string
  status: 'borrador' | 'en-carrito' | 'comprado'
  estimatedValue: number
  createdAt: string
}

const statusConfig: Record<RecentDesign['status'], { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  borrador: { label: 'Borrador', variant: 'outline' },
  'en-carrito': { label: 'En Carrito', variant: 'secondary' },
  comprado: { label: 'Comprado', variant: 'default' },
}

interface RecentDesignsProps {
  designs: RecentDesign[]
  className?: string
}

export function RecentDesigns({ designs, className }: RecentDesignsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-sans text-base font-semibold">
          Disenos Recientes
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/disenos">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => {
            const status = statusConfig[design.status]

            return (
              <div
                key={design.id}
                className="group overflow-hidden rounded-lg border border-border bg-secondary/30 transition-colors hover:border-primary/50"
              >
                {/* Preview Image Placeholder */}
                <div className="relative aspect-square bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-primary/10" />
                      <p className="font-sans text-xs text-muted-foreground">
                        Preview
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={status.variant} 
                    className="absolute right-2 top-2 font-sans"
                  >
                    {status.label}
                  </Badge>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-sans text-sm font-medium text-foreground truncate">
                    {design.productName}
                  </p>
                  <p className="mt-0.5 font-serif text-xs text-muted-foreground truncate">
                    {design.userName}
                  </p>
                  
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-sans text-sm font-semibold text-primary">
                      {formatCurrency(design.estimatedValue)}
                    </span>
                    <span className="font-serif text-xs text-muted-foreground">
                      {formatDate(design.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
