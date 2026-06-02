'use client'

import { useParams } from 'next/navigation'
import { CustomizerExperience } from '@/src/features/storefront/customizer/components/customizer-experience'

export default function CustomizeProductPage() {
  const params = useParams()
  const productSlug =
    typeof params.productSlug === 'string' ? params.productSlug : null

  return <CustomizerExperience initialProductSlug={productSlug} />
}
