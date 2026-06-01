import type { Metadata } from 'next'
import { CustomizerShell } from '@/src/features/storefront/customizer'

export const metadata: Metadata = {
  title: 'Personaliza tu uniforme | Chef Room by Bedolla',
  description:
    'Diseña uniformes de chef personalizados con vista 3D y controles de personalizacion. Demo tecnica.',
}

export default function CustomizePage() {
  return <CustomizerShell />
}
