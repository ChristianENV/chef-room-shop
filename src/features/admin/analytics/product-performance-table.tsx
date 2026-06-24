'use client'

import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// TODO: Replace with TanStack Query for real product analytics
interface ProductPerformance {
  id: string
  name: string
  category: string
  designsCreated: number
  addedToCart: number
  purchased: number
  conversion: number
  avgCustomizationValue: number
  popularColor: {
    name: string
    hex: string
  }
}

interface ProductPerformanceTableProps {
  products: ProductPerformance[]
  className?: string
}

export function ProductPerformanceTable({ products, className }: ProductPerformanceTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Producto</TableHead>
            <TableHead className="font-sans text-right">Disenos</TableHead>
            <TableHead className="font-sans text-right">Al carrito</TableHead>
            <TableHead className="font-sans text-right">Comprados</TableHead>
            <TableHead className="font-sans text-right">Conversion</TableHead>
            <TableHead className="font-sans text-right">Valor prom.</TableHead>
            <TableHead className="font-sans">Color popular</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div>
                  <p className="font-sans text-sm font-medium text-foreground">{product.name}</p>
                  <p className="font-serif text-xs text-muted-foreground capitalize">
                    {product.category}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {product.designsCreated.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {product.addedToCart.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {product.purchased.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant="secondary"
                  className={cn(
                    'font-mono',
                    product.conversion >= 20 && 'bg-success/10 text-success',
                    product.conversion >= 10 &&
                      product.conversion < 20 &&
                      'bg-warning/10 text-warning',
                    product.conversion < 10 && 'bg-destructive/10 text-destructive',
                  )}
                >
                  {product.conversion.toFixed(1)}%
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                ${product.avgCustomizationValue.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded border border-border"
                    style={{ backgroundColor: product.popularColor.hex }}
                  />
                  <span className="font-serif text-sm text-muted-foreground">
                    {product.popularColor.name}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
