import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CustomizerExperience } from '@/src/features/storefront/customizer/components/customizer-experience'
import { CustomizerLoading } from '@/src/features/storefront/customizer/components/customizer-loading'

export const metadata: Metadata = {
  title: 'Diseña tu uniforme | Chef Room by Bedolla',
  description:
    'Personaliza filipinas, mandiles y pantalones con colores, bordados y logos. Comienza tu diseño en segundos.',
}

export default function CustomizePage() {
  return (
    <Suspense fallback={<CustomizerLoading />}>
      <CustomizerExperience />
    </Suspense>
  )
}
