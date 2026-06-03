import type { Metadata } from 'next'
import { CustomizerExperience } from '@/src/features/storefront/customizer/components/customizer-experience'

export const metadata: Metadata = {
  title: 'Diseña tu uniforme | Chef Room by Bedolla',
  description:
    'Personaliza filipinas, mandiles y pantalones con colores, bordados y logos. Comienza tu diseño en segundos.',
}

export default function CustomizePage() {
  return <CustomizerExperience />
}
