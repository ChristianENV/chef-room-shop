import { notFound } from 'next/navigation'
import { ChefJacketSmokeViewport } from '@/src/features/storefront/customizer/3d/chef-jacket-smoke-scene'
import { isDevDiagnosticsRouteEnabled } from '@/src/features/storefront/customizer/3d/chef-jacket-smoke-config'

export default function ChefJacket3dSmokePage() {
  if (!isDevDiagnosticsRouteEnabled()) {
    notFound()
  }

  return (
    <main
      data-testid="chef-jacket-smoke-page"
      className="mx-auto min-h-screen max-w-5xl px-4 py-8 text-white"
    >
      <h1 className="mb-2 text-2xl font-semibold">Chef Jacket 3D — smoke test</h1>
      <p className="mb-6 text-sm text-white/60">
        Escena mínima aislada. Sin store, decals, overlays ni fit del customizador. Modelo:{' '}
        <code className="text-white/80">/images/models/customizer/chef-jacket/chef-jacket.gltf</code>
      </p>
      <ChefJacketSmokeViewport />
    </main>
  )
}
