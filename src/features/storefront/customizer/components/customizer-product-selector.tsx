'use client'

import { Check, ChevronDown, Shirt } from 'lucide-react'
import { ProductImageDisplay } from '@/components/shared/product-image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CatalogProduct, CatalogProductImage } from '@/src/features/storefront/catalog/types'

interface CustomizerProductSelectorProps {
  products: CatalogProduct[]
  selectedSlug: string | null
  onSelectProduct: (slug: string) => void
}

function catalogPrimaryImageUrl(images: CatalogProductImage[]): string | null {
  const primary = images.find((image) => image.isPrimary && image.url?.trim())
  const fallback = images.find((image) => image.url?.trim())
  return primary?.url?.trim() ?? fallback?.url?.trim() ?? null
}

function garmentLabel(product: CatalogProduct): string {
  return product.productType.name ?? product.productType.slug
}

export function CustomizerProductSelector({
  products,
  selectedSlug,
  onSelectProduct,
}: CustomizerProductSelectorProps) {
  const selected = products.find((product) => product.slug === selectedSlug) ?? products[0] ?? null

  if (!selected) return null

  const selectedImageUrl = catalogPrimaryImageUrl(selected.images)

  return (
    <div className="border-b border-border/30 px-4 py-3" data-testid="customizer-product-selector">
      <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Elige una prenda para comenzar
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="customizer-glass flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-card/80"
            data-testid="customizer-selected-product"
          >
            {selectedImageUrl ? (
              <ProductImageDisplay
                src={selectedImageUrl}
                alt={selected.name}
                fill={false}
                className="size-10 shrink-0 rounded-lg"
                placeholderIconClassName="size-4"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <Shirt className="size-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-semibold text-foreground">
                {selected.name}
              </p>
              <p className="truncate font-serif text-xs text-muted-foreground">
                {garmentLabel(selected)}
              </p>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[min(100vw-2rem,20rem)]">
          {products.map((product) => {
            const imageUrl = catalogPrimaryImageUrl(product.images)
            const isSelected = product.slug === selected.slug

            return (
              <DropdownMenuItem
                key={product.id}
                onClick={() => onSelectProduct(product.slug)}
                className="flex items-center gap-3 py-2.5"
                data-testid="customizer-product-option"
              >
                {imageUrl ? (
                  <ProductImageDisplay
                    src={imageUrl}
                    alt={product.name}
                    fill={false}
                    className="size-9 shrink-0 rounded-md"
                    placeholderIconClassName="size-4"
                  />
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
                    <Shirt className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-medium">{product.name}</p>
                  <p className="truncate font-serif text-xs text-muted-foreground">
                    {garmentLabel(product)}
                  </p>
                </div>
                {isSelected ? <Check className="size-4 text-primary" /> : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
