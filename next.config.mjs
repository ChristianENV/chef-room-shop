/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Storefront legacy (Spanish)
      { source: '/catalogo', destination: '/shop', permanent: true },
      { source: '/filipinas', destination: '/shop/chef-jackets', permanent: true },
      { source: '/mandiles', destination: '/shop/aprons', permanent: true },
      { source: '/pantalones', destination: '/shop/pants', permanent: true },
      { source: '/productos/:slug*', destination: '/products/:slug*', permanent: true },
      { source: '/personalizar', destination: '/customize', permanent: true },
      { source: '/personaliza', destination: '/customize', permanent: true },
      { source: '/carrito', destination: '/cart', permanent: true },
      { source: '/registro', destination: '/register', permanent: true },
      { source: '/cuenta', destination: '/account', permanent: true },
      { source: '/cuenta/pedidos', destination: '/account/orders', permanent: true },
      { source: '/cuenta/disenos', destination: '/account/designs', permanent: true },
      { source: '/cuenta/direcciones', destination: '/account/addresses', permanent: true },
      { source: '/cuenta/:path*', destination: '/account/:path*', permanent: true },
      { source: '/contacto', destination: '/contact', permanent: true },
      { source: '/restaurantes', destination: '/restaurants', permanent: true },
      { source: '/guia-de-tallas', destination: '/size-guide', permanent: true },
      { source: '/guia-tallas', destination: '/size-guide', permanent: true },
      { source: '/guia-bordados', destination: '/size-guide', permanent: true },
      { source: '/mayoreo', destination: '/contact', permanent: true },
      { source: '/recuperar-contrasena', destination: '/login', permanent: true },
      { source: '/privacidad', destination: '/privacy', permanent: true },
      { source: '/terminos', destination: '/terms', permanent: true },
      { source: '/iniciar-sesion', destination: '/login', permanent: true },
      { source: '/filipinas-personalizadas', destination: '/shop/chef-jackets', permanent: true },
      { source: '/mandiles-personalizados', destination: '/shop/aprons', permanent: true },
      { source: '/uniformes-para-restaurantes', destination: '/restaurants', permanent: true },
      // Admin legacy (Spanish paths)
      { source: '/admin', destination: '/admin/dashboard', permanent: false },
      { source: '/admin/productos', destination: '/admin/products', permanent: true },
      { source: '/admin/ordenes', destination: '/admin/orders', permanent: true },
      { source: '/admin/ordenes/:path*', destination: '/admin/orders/:path*', permanent: true },
      { source: '/admin/personalizacion', destination: '/admin/customization', permanent: true },
      { source: '/admin/customizecion', destination: '/admin/customization', permanent: true },
      { source: '/admin/configuracion', destination: '/admin/settings', permanent: true },
      { source: '/admin/disenos', destination: '/admin/designs', permanent: true },
      { source: '/admin/usuarios', destination: '/admin/users', permanent: true },
      { source: '/admin/pagos', destination: '/admin/payments', permanent: true },
      { source: '/admin/envios', destination: '/admin/shipping', permanent: true },
      { source: '/admin/analitica', destination: '/admin/analytics', permanent: true },
      { source: '/admin/produccion', destination: '/admin/dashboard', permanent: true },
    ]
  },
}

export default nextConfig
