import {
  HeroSection,
  TrustStrip,
  CategorySection,
  CustomizerTeaser,
  FeaturedProducts,
  HowItWorks,
  BrandStorySection,
  FinalCTA,
} from '@/src/features/storefront/landing'

export const metadata = {
  title: 'Chef Room by Bedolla | Uniformes de Chef Personalizables',
  description: 'Disena uniformes profesionales para chef con colores, bordados, logotipos y detalles pensados para tu estilo de cocina. Tu cocina te define, tu uniforme te distingue.',
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <CategorySection />
      <CustomizerTeaser />
      <FeaturedProducts />
      <HowItWorks />
      <BrandStorySection />
      <FinalCTA />
    </>
  )
}
