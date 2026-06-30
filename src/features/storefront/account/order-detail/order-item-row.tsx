import Image from 'next/image'
import { Package } from 'lucide-react'

import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import { CartCommercialOptionsSummary } from '@/src/features/storefront/cart/components/cart-commercial-options-summary'
import type { AccountOrderItem } from '../types'
import { OrderDesignSummary } from './order-design-summary'
import { parseDesignSnapshot, parseProductSnapshot } from './order-detail.utils'

type OrderItemRowProps = {
  item: AccountOrderItem
}

/**
 * Single order line with product snapshot and optional customization block.
 */
export function OrderItemRow({ item }: OrderItemRowProps) {
  const product = parseProductSnapshot(item.productSnapshotJson)
  const design = parseDesignSnapshot(item.designSnapshotJson)
  const displayName = product.name ?? item.name
  const unitPesos = centsToPesos(item.unitPriceCents)
  const linePesos = centsToPesos(item.totalPriceCents)

  const sizeLabel =
    product.sizeName ?? design?.selectedSize?.label ?? design?.selectedSize?.name ?? null
  const fabricColorName =
    product.fabricColorName ??
    product.colorName ??
    design?.fabricColor?.name ??
    design?.selectedColor?.name ??
    null
  const detailColorName = design?.detailColor?.name ?? product.detailColorName ?? null

  return (
    <li className="flex gap-4 border-b border-border py-5 last:border-0 last:pb-0">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={displayName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground/40" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-sans font-semibold text-foreground">{displayName}</h3>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Cantidad: {item.quantity}
              {item.sku || product.sku ? ` · SKU ${item.sku ?? product.sku}` : ''}
              {sizeLabel ? (
                <>
                  {' · '}
                  <span data-testid="order-item-selected-size">Talla {sizeLabel}</span>
                </>
              ) : null}
              {fabricColorName ? (
                <>
                  {' · '}
                  <span data-testid="order-item-selected-fabric-color">Tela {fabricColorName}</span>
                </>
              ) : null}
              {detailColorName ? ` · Detalle ${detailColorName}` : null}
            </p>
            <p className="font-serif text-xs text-muted-foreground">
              {formatCurrencyMXN(unitPesos)} c/u
              {item.customizationPriceCents > 0 &&
                ` · Personalización ${formatCurrencyMXN(centsToPesos(item.customizationPriceCents))}`}
            </p>
            {item.commercialOptionsSnapshot.length > 0 ? (
              <div className="mt-3" data-testid="order-item-commercial-options">
                <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Opciones
                </p>
                <CartCommercialOptionsSummary options={item.commercialOptionsSnapshot} />
              </div>
            ) : null}
          </div>
          <p className="shrink-0 font-sans text-lg font-semibold text-foreground">
            {formatCurrencyMXN(linePesos)}
          </p>
        </div>

        {design ? (
          <OrderDesignSummary design={design} />
        ) : item.customizationPriceCents > 0 ? (
          <p className="mt-2 font-serif text-xs text-muted-foreground">Personalizado</p>
        ) : (
          <p className="mt-2 font-serif text-xs text-muted-foreground">Sin personalización</p>
        )}
      </div>
    </li>
  )
}
