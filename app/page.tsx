import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import {
  HeroSection,
  TrustStrip,
  CategorySection,
  CustomizerTeaser,
  FeaturedProducts,
  HowItWorks,
  BrandStorySection,
  FinalCTA,
} from '@/components/landing'

export const metadata = {
  title: 'Chef Room by Bedolla | Uniformes de Chef Personalizables',
  description: 'Disena uniformes profesionales para chef con colores, bordados, logotipos y detalles pensados para tu estilo de cocina. Tu cocina te define, tu uniforme te distingue.',
}

export default function LandingPage() {
  // TODO: Replace with real cart data from context/state
  const cartItemCount = 0
  
  // TODO: Replace with real auth state
  const isLoggedIn = false

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader cartItemCount={cartItemCount} isLoggedIn={isLoggedIn} />
      
      <main>
        {/* Hero Section */}
        {/* TODO: Track hero_view event for analytics */}
        <HeroSection />
        
        {/* Trust Strip */}
        <TrustStrip />
        
        {/* Category Section */}
        {/* TODO: Track category_click events for analytics */}
        <CategorySection />
        
        {/* Customizer Teaser */}
        {/* TODO: Track customizer_cta_click event for analytics */}
        <CustomizerTeaser />
        
        {/* Featured Products */}
        {/* TODO: Fetch products from API with TanStack Query */}
        {/* TODO: Track product_view and product_click events for analytics */}
        <FeaturedProducts />
        
        {/* How It Works */}
        <HowItWorks />
        
        {/* Brand Story */}
        <BrandStorySection />
        
        {/* Final CTA */}
        {/* TODO: Track final_cta_click event for analytics */}
        <FinalCTA />
      </main>
      
      <PublicFooter />
    </div>
  )
}
