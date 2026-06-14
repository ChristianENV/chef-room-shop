'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { CustomizerExperience } from '@/src/features/storefront/customizer/components/customizer-experience'
import { CustomizerLoading } from '@/src/features/storefront/customizer/components/customizer-loading'

export default function CustomizeProductPage() {
  const params = useParams()
  const productSlug =
    typeof params.productSlug === 'string' ? params.productSlug : null

  return (
    <Suspense fallback={<CustomizerLoading />}>
      <CustomizerExperience initialProductSlug={productSlug} />
    </Suspense>
  )
}
