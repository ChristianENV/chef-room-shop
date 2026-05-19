/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
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
      { source: '/iniciar-sesion', destination: '/login', permanent: true },
      { source: '/filipinas-personalizadas', destination: '/shop/chef-jackets', permanent: true },
      { source: '/mandiles-personalizados', destination: '/shop/aprons', permanent: true },
      { source: '/uniformes-para-restaurantes', destination: '/restaurants', permanent: true },
      { source: '/uniformes-para-chef', destination: '/shop', permanent: true },
    ]
  },
}

export default nextConfig
